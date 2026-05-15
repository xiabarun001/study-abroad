# Application Tracking System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a Kanban-style application tracking board with deadline reminders.

**Architecture:** A new `user_applications` table in Supabase. A React component with drag/drop or dropdown status updates and a dynamic top-section timeline.

**Tech Stack:** React, Tailwind CSS, Supabase, React Router

---

### Task 1: Database Migration Script

**Files:**
- Create: `supabase/migrations/20260515_app_tracking.sql`

- [ ] **Step 1: Write the SQL script**

```sql
-- Create user_applications table
CREATE TABLE public.user_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('planning', 'preparing', 'submitted', 'waiting', 'result')),
    deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, program_id)
);

-- Enable RLS
ALTER TABLE public.user_applications ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view their own applications" 
ON public.user_applications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications" 
ON public.user_applications FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications" 
ON public.user_applications FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applications" 
ON public.user_applications FOR DELETE 
USING (auth.uid() = user_id);

-- Create a trigger for updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_user_applications
BEFORE UPDATE ON public.user_applications
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260515_app_tracking.sql
git commit -m "chore: add db migration script for application tracking"
```

### Task 2: Application Service

**Files:**
- Create: `src/services/applicationService.js`

- [ ] **Step 1: Create applicationService.js**

```javascript
import { supabase } from '../shared/db/supabase';
import { handleResponse } from './baseService';

export const applicationService = {
  async getApplications(userId) {
    return handleResponse(
      supabase
        .from('user_applications')
        .select(`
          id,
          status,
          deadline,
          program_id,
          programs (*)
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
    );
  },

  async createApplication(userId, programId) {
    return handleResponse(
      supabase
        .from('user_applications')
        .insert([{ 
          user_id: userId, 
          program_id: programId,
          status: 'planning'
        }])
    );
  },

  async updateStatus(id, newStatus) {
    return handleResponse(
      supabase
        .from('user_applications')
        .update({ status: newStatus })
        .eq('id', id)
    );
  },

  async updateDeadline(id, newDeadline) {
    return handleResponse(
      supabase
        .from('user_applications')
        .update({ deadline: newDeadline })
        .eq('id', id)
    );
  },

  async deleteApplication(id) {
    return handleResponse(
      supabase
        .from('user_applications')
        .delete()
        .eq('id', id)
    );
  }
};
```

- [ ] **Step 2: Commit**

```bash
git add src/services/applicationService.js
git commit -m "feat: add application service"
```

### Task 3: Main Layout Updates

**Files:**
- Modify: `src/layouts/MainLayout.jsx`

- [ ] **Step 1: Add "我的申请" to header**

```javascript
// Replace the nav section in MainLayout.jsx:
          <nav className="hidden lg:flex items-center gap-8">
            <span className="font-semibold text-primary cursor-pointer">快速评测</span>
            {user && (
              <>
                <span onClick={() => navigate('/applications')} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">我的申请</span>
                <span onClick={() => navigate('/favorites')} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">我的收藏</span>
              </>
            )}
          </nav>
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/MainLayout.jsx
git commit -m "feat: add applications link to main layout"
```

### Task 4: Favorites Page Integration

**Files:**
- Modify: `src/pages/FavoritesPage.jsx`

- [ ] **Step 1: Add "启动申请" functionality**

Import `applicationService`.
Add `handleStartApplication` function.
Add a button to the program card.

```javascript
// In FavoritesPage.jsx:
import { applicationService } from '../services/applicationService';

// ... inside the component
  const handleStartApplication = async (programId) => {
    try {
      await applicationService.createApplication(user.id, programId);
      navigate('/applications');
    } catch (err) {
      if (err.code === '23505') {
        alert('您已经将该项目加入到了申请列表中！');
        navigate('/applications');
      } else {
        console.error('Failed to start application:', err);
      }
    }
  };

// ... inside the card JSX
                <div className="mt-auto flex justify-between items-center">
                  <button onClick={() => handleStartApplication(program.id)} className="text-sm bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-lg hover:bg-indigo-100 font-semibold transition-colors">
                    ✨ 启动申请
                  </button>
                  {program.url && (
                    <a href={program.url} target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold text-sm hover:underline">
                      查看详情 →
                    </a>
                  )}
                </div>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/FavoritesPage.jsx
git commit -m "feat: add start application button to favorites"
```

### Task 5: Applications Page & Route

**Files:**
- Create: `src/pages/ApplicationsPage.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create ApplicationsPage.jsx**

```javascript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { applicationService } from '../services/applicationService';

const STATUS_COLUMNS = [
  { id: 'planning', title: '规划中' },
  { id: 'preparing', title: '准备材料' },
  { id: 'submitted', title: '已提交' },
  { id: 'waiting', title: '面试/等待' },
  { id: 'result', title: '结果' }
];

export function ApplicationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApps = async () => {
    if (!user) return;
    try {
      const data = await applicationService.getApplications(user.id);
      if (data) setApps(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [user]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setApps(apps.map(a => a.id === id ? { ...a, status: newStatus } : a));
      await applicationService.updateStatus(id, newStatus);
    } catch (err) {
      console.error(err);
      fetchApps();
    }
  };

  const handleDeadlineChange = async (id, newDeadline) => {
    try {
      setApps(apps.map(a => a.id === id ? { ...a, deadline: newDeadline } : a));
      await applicationService.updateDeadline(id, newDeadline);
    } catch (err) {
      console.error(err);
      fetchApps();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("确定要删除这条申请记录吗？")) return;
    try {
      setApps(apps.filter(a => a.id !== id));
      await applicationService.deleteApplication(id);
    } catch (err) {
      console.error(err);
      fetchApps();
    }
  };

  if (authLoading || loading) return <div className="p-10 text-center">加载中...</div>;
  if (!user) return <div className="p-10 text-center">请先登录</div>;

  // Calculate urgent items (deadline within 14 days and not in result)
  const urgentApps = apps.filter(a => {
    if (a.status === 'result' || !a.deadline) return false;
    const diff = (new Date(a.deadline) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 14;
  }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  return (
    <div className="flex flex-col w-full h-full p-8 overflow-y-auto bg-slate-50">
      <h2 className="text-3xl font-bold mb-6 font-outfit text-slate-800">我的申请</h2>
      
      {urgentApps.length > 0 && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-4 shadow-sm">
          <h3 className="text-red-600 font-bold mb-3 flex items-center gap-2">
            <span>🚨</span> 紧迫任务提醒
          </h3>
          <div className="flex flex-col gap-2">
            {urgentApps.map(a => (
              <div key={a.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-red-100">
                <span className="font-semibold text-slate-800">{a.programs?.title}</span>
                <span className="text-red-500 font-bold text-sm">距离截止: {Math.ceil((new Date(a.deadline) - new Date()) / (1000 * 60 * 60 * 24))} 天</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-6 overflow-x-auto pb-4 h-full">
        {STATUS_COLUMNS.map(col => (
          <div key={col.id} className="flex flex-col min-w-[300px] w-[300px] bg-slate-100 rounded-2xl p-4 border border-slate-200">
            <h3 className="font-bold text-slate-700 mb-4 flex justify-between">
              {col.title}
              <span className="bg-white text-slate-500 px-2 py-0.5 rounded-full text-xs">
                {apps.filter(a => a.status === col.id).length}
              </span>
            </h3>
            <div className="flex flex-col gap-3 overflow-y-auto">
              {apps.filter(a => a.status === col.id).map(app => (
                <div key={app.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group relative">
                  <button onClick={() => handleDelete(app.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                  <h4 className="font-bold text-slate-800 text-lg mb-1 leading-tight pr-6">{app.programs?.title}</h4>
                  
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                    <input 
                      type="date" 
                      value={app.deadline || ''} 
                      onChange={(e) => handleDeadlineChange(app.id, e.target.value)}
                      className="text-xs text-slate-500 bg-transparent border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-500"
                    />
                    <select 
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className="text-xs font-semibold bg-indigo-50 text-indigo-700 rounded px-2 py-1 outline-none cursor-pointer border-none"
                    >
                      {STATUS_COLUMNS.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update App.jsx**

```javascript
// Add import:
import { ApplicationsPage } from './pages/ApplicationsPage';

// Add Route:
<Route path="/applications" element={<ApplicationsPage />} />
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/ApplicationsPage.jsx src/App.jsx
git commit -m "feat: implement application tracking board"
```
