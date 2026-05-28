# 留学申请中心 (Application Hub) 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在项目中增加“申请中心” (Application Hub) 仪表盘门户页面，将原有的“我的收藏”与“我的申请”合流，并全面升级状态追踪由 5 个状态到 7 个状态。

**Architecture:** 新建独立 Dashboard 路由页面；修改主布局导航隐藏收藏/申请并添加申请中心；扩充全局看板状态列至 7 状态并为数据库配置迁移 SQL。

**Tech Stack:** React 19, React Router v7, TailwindCSS, Supabase, Lucide React (如有图标，或使用 emoji)

---

### Task 1: 状态扩展与样式适配 (Kanban & Calendar)

**Files:**
- Modify: `src/components/ApplicationKanban.jsx:3-10`
- Modify: `src/components/ApplicationCalendar.jsx:3-11`

- [ ] **Step 1: 扩展 ApplicationKanban.jsx 的状态列列表**
  
  将 `src/components/ApplicationKanban.jsx` 的第 4 行的 `STATUS_COLUMNS` 常量修改为 7 种状态定义。
  
  修改前：
  ```javascript
  const STATUS_COLUMNS = [
    { id: 'planning', title: '规划中' },
    { id: 'preparing', title: '准备材料' },
    { id: 'submitted', title: '已提交' },
    { id: 'waiting', title: '面试/等待' },
    { id: 'result', title: '结果' }
  ];
  ```
  
  修改后：
  ```javascript
  const STATUS_COLUMNS = [
    { id: 'planning', title: '规划中' },
    { id: 'preparing', title: '准备材料中' },
    { id: 'supplement', title: '补充材料中' },
    { id: 'submitted', title: '已提交' },
    { id: 'waiting', title: '面试/等待' },
    { id: 'offer', title: '已获录取 (Offer)' },
    { id: 'rejected', title: '已拒绝' }
  ];
  ```

- [ ] **Step 2: 扩展 ApplicationCalendar.jsx 的状态颜色映射**
  
  将 `src/components/ApplicationCalendar.jsx` 的 `STATUS_COLORS` 修改为支持新状态。
  
  修改前：
  ```javascript
  const STATUS_COLORS = {
    planning: 'bg-blue-100 text-blue-700 border-blue-200',
    preparing: 'bg-purple-100 text-purple-700 border-purple-200',
    submitted: 'bg-green-100 text-green-700 border-green-200',
    waiting: 'bg-amber-100 text-amber-700 border-amber-200',
    result: 'bg-slate-200 text-slate-700 border-slate-300'
  };
  ```
  
  修改后：
  ```javascript
  const STATUS_COLORS = {
    planning: 'bg-blue-100 text-blue-700 border-blue-200',
    preparing: 'bg-purple-100 text-purple-700 border-purple-200',
    supplement: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    submitted: 'bg-teal-100 text-teal-700 border-teal-200',
    waiting: 'bg-amber-100 text-amber-700 border-amber-200',
    offer: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-100 text-rose-700 border-rose-200',
    result: 'bg-slate-200 text-slate-700 border-slate-300'
  };
  ```

---

### Task 2: 路由配置与全局导航改版

**Files:**
- Modify: `src/App.jsx:9-12`, `src/App.jsx:34-37`
- Modify: `src/layouts/MainLayout.jsx:43-48`

- [ ] **Step 1: 新增 /hub 路由映射**
  
  在 `src/App.jsx` 中导入并挂载 `ApplicationHubPage` 组件，在 `/favorites` 路由上方插入 `/hub`。
  
  导入：
  ```javascript
  import { ApplicationHubPage } from './pages/ApplicationHubPage';
  ```
  
  路由配置处：
  ```javascript
            <Route path="/hub" element={<ApplicationHubPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
  ```

- [ ] **Step 2: 修改主布局 MainLayout 导航项**
  
  在 `src/layouts/MainLayout.jsx` 中将原有的“我的申请”和“我的收藏”替换为“申请中心”入口，指向 `/hub`。
  
  修改前：
  ```javascript
              {user && (
                <>
                  <span onClick={() => navigate('/applications')} className="text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">我的申请</span>
                  <span onClick={() => navigate('/favorites')} className="text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">我的收藏</span>
                </>
              )}
  ```
  
  修改后：
  ```javascript
              {user && (
                <span onClick={() => navigate('/hub')} className="text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">申请中心</span>
              )}
  ```

---

### Task 3: 编写申请中心门户页面 (ApplicationHubPage)

**Files:**
- Create: `src/pages/ApplicationHubPage.jsx`

- [ ] **Step 1: 编写页面布局与逻辑**
  
  新建 `src/pages/ApplicationHubPage.jsx` 并实现以下功能：
  * 引入 `useAuth` 并加入未登录自动跳转到首页的拦截器。
  * 组合调用 `applicationService.getApplications` 以及 `favoriteService.getFavorites` 拉取用户的所有申请记录和收藏记录。
  * 大盘数据统计：进行中数量（规划/准备/提交/等待/补充等）、Offer 数量、已收藏数量。
  * 临近截止：筛选 7 天内即将截止的申请记录并红色标红高亮。
  * 快捷收藏：展示最近 3 个收藏项，附带“🚀 启动申请”按钮。一键调用 `applicationService.createApplication` 插入申请记录，并弹出确认动画，最后跳转到 `/applications` 看板。
  * 界面：支持微交互渐变投影的 HSL 卡片与玻璃质感卡片布局。

---

### Task 4: 提供 Supabase 数据库更改脚本及测试

**Files:**
- Create: `supabase/migrations/20260527_extend_application_status.sql`

- [ ] **Step 1: 写入数据库约束修改的 SQL 脚本**
  
  写入 `supabase/migrations/20260527_extend_application_status.sql`，其内容如下：
  ```sql
  -- 1. 尝试删除已有字段约束
  ALTER TABLE public.user_applications 
  DROP CONSTRAINT IF EXISTS user_applications_status_check;

  -- 2. 重新添加支持 7 个新状态的约束，同时保留旧的 'result' 作为兼容
  ALTER TABLE public.user_applications 
  ADD CONSTRAINT user_applications_status_check 
  CHECK (status IN (
      'planning', 
      'preparing', 
      'supplement', 
      'submitted', 
      'waiting', 
      'offer', 
      'rejected', 
      'result'
  ));

  -- 3. 将已有老数据中的 'result' 状态全部变更为 'offer'
  UPDATE public.user_applications 
  SET status = 'offer' 
  WHERE status = 'result';
  ```
