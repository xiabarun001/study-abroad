# AI 顾问智能体记忆与多会话系统 (Agent Memory & Sessions) 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为留学通的 AI 顾问智能体实现基于 Supabase 云端的多会话管理与长期记忆能力，并升级大模型系统提示词以实现主动引导、官网检索Fact-Checking与个性化习惯学习。

**Architecture:** 前端通过 React 状态机与新建的 `chatService.js` 直接操纵 Supabase 中的 `chat_sessions`（含 JSONB 格式的推荐库）与 `chat_messages`（带级联删除与 RLS 保障），Electron 端负责通过升级后的 System Prompt 触发联网搜索与结构化推荐并回传给前端。

**Tech Stack:** React 19, Electron 41, Supabase PostgreSQL, Tailwind CSS

---

## 阶段文件映射表
*   **新建** [chatService.js](file:///e:/Projects/study-abroad/src/services/chatService.js)：负责会话和聊天消息的云端数据库增删改查。
*   **修改** [ai_advisor.js](file:///e:/Projects/study-abroad/electron/main/ai_advisor.js)：升级 System Prompt 以融入全套专家导师准则。
*   **修改** [AiAdvisorPage.jsx](file:///e:/Projects/study-abroad/src/pages/AiAdvisorPage.jsx)：重构整个 UI 界面，实现会话历史加载、切换、智能命名与推荐列表沙箱隔离。

---

## 任务拆解与开发步骤

### Task 1: Supabase 数据库表与安全策略迁移

**Files:**
*   Create: `supabase/migrations/20260528_create_chat_history.sql` (本地备份迁移文件)

- [ ] **Step 1: 写入 SQL 脚本到本地迁移文件中**
  在本地项目中创建文件 `supabase/migrations/20260528_create_chat_history.sql`，内容如下：
  ```sql
  -- 1. 创建会话表
  CREATE TABLE IF NOT EXISTS public.chat_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      title TEXT NOT NULL DEFAULT '新会话',
      recommended_programs JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );

  -- 2. 创建消息表
  CREATE TABLE IF NOT EXISTS public.chat_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );

  -- 3. 启用 RLS
  ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

  -- 4. 会话表 RLS 安全策略
  CREATE POLICY "Users can manage their own chat sessions" 
      ON public.chat_sessions
      FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);

  -- 5. 消息表 RLS 安全策略
  CREATE POLICY "Users can manage their own messages" 
      ON public.chat_messages
      FOR ALL
      USING (
          EXISTS (
              SELECT 1 FROM public.chat_sessions s 
              WHERE s.id = chat_messages.session_id AND s.user_id = auth.uid()
          )
      );
  ```

- [ ] **Step 2: 提示并引导用户在 Supabase 控制台执行该 SQL**
  输出 SQL，引导用户在云端 SQL Editor 粘贴并执行。

- [ ] **Step 3: 确认表结构创建成功**
  用户执行成功后，提示继续。
  
- [ ] **Step 4: Commit 本地 SQL 迁移文件**
  ```bash
  git add supabase/migrations/20260528_create_chat_history.sql
  git commit -m "migration: add chat sessions and messages tables with RLS"
  ```

---

### Task 2: 编写数据库服务层接口 (`chatService.js`)

**Files:**
*   Create: `src/services/chatService.js`

- [ ] **Step 1: 创建 `chatService.js` 并实现 CRUD 方法**
  在 `src/services/chatService.js` 中写入如下内容：
  ```javascript
  import { supabase } from '../shared/db/supabase';
  import { handleResponse } from './baseService';

  /**
   * 智能体对话与记忆服务层 (Chat & Memory Service)
   * 负责将会话和历史消息持久化写入 Supabase 云端数据库并附带详细中文注释
   */
  export const chatService = {
    /**
     * 获取用户的所有会话列表，按更新时间降序排列
     * @param {string} userId - 用户 UUID
     */
    async getSessions(userId) {
      return handleResponse(
        supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
      );
    },

    /**
     * 创建一个新会话，默认标题为“新会话”，推荐列表为空数组
     * @param {string} userId - 用户 UUID
     * @param {string} title - 会话标题
     */
    async createSession(userId, title = '新会话') {
      return handleResponse(
        supabase
          .from('chat_sessions')
          .insert([{ user_id: userId, title, recommended_programs: [] }])
          .select()
          .single()
      );
    },

    /**
     * 删除指定会话，级联删除会自动清空对应的历史消息记录
     * @param {string} sessionId - 会话 UUID
     */
    async deleteSession(sessionId) {
      return handleResponse(
        supabase
          .from('chat_sessions')
          .delete()
          .eq('id', sessionId)
      );
    },

    /**
     * 更新会话标题（通常为智能提取的用户提问首句）
     * @param {string} sessionId - 会话 UUID
     * @param {string} newTitle - 新标题内容
     */
    async updateSessionTitle(sessionId, newTitle) {
      return handleResponse(
        supabase
          .from('chat_sessions')
          .update({ title: newTitle, updated_at: new Date() })
          .eq('id', sessionId)
      );
    },

    /**
     * 覆盖更新会话聚合产生的 AI 推荐列表 JSON
     * @param {string} sessionId - 会话 UUID
     * @param {Array} recommendedPrograms - 推荐项目列表数组
     */
    async updateSessionRecommendations(sessionId, recommendedPrograms) {
      return handleResponse(
        supabase
          .from('chat_sessions')
          .update({ recommended_programs: recommendedPrograms, updated_at: new Date() })
          .eq('id', sessionId)
      );
    },

    /**
     * 获取某个会话下的所有历史对话消息，按创建时间正序加载
     * @param {string} sessionId - 会话 UUID
     */
    async getMessages(sessionId) {
      return handleResponse(
        supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true })
      );
    },

    /**
     * 保存单条对话消息（无论是用户发送的，还是 AI 回复的）
     * @param {string} sessionId - 会话 UUID
     * @param {string} role - 角色，只能是 'user' | 'assistant' | 'system'
     * @param {string} content - 对话文本正文
     */
    async saveMessage(sessionId, role, content) {
      return handleResponse(
        supabase
          .from('chat_messages')
          .insert([{ session_id: sessionId, role, content }])
      );
    }
  };
  ```

- [ ] **Step 2: Commit 代码**
  ```bash
  git add src/services/chatService.js
  git commit -m "feat: implement chatService for cloud persistent memory"
  ```

---

### Task 3: 升级主进程中的大模型系统提示词与 Rules (`ai_advisor.js`)

**Files:**
*   Modify: `electron/main/ai_advisor.js`

- [ ] **Step 1: 升级系统提示词 (System Prompt)**
  修改 `electron/main/ai_advisor.js` 的 `chatWithAgent` 函数。定位到行 31-33，替换原有 `systemMsg`：
  ```javascript
  // 1. Ask LLM (使用升级版的专家导师系统准则并带有中文注释说明)
  const systemMsg = { 
    role: 'system', 
    content: `你是一个具有多年行业经验、专业且热诚的“留学申请专家导师与顾问”。你的语气应当专业、严谨、温暖且循循善诱，致力于通过科学的规划帮助用户实现留学梦想。

# 核心能力与范围
1. 留学百科全书：解答关于留学的一切事宜，包括院校库与项目探索、申请流程与关键时间线规划、签证指导、海外生活与住宿指引、费用预算等。
2. 主动背景匹配与定位：如果用户不知道自己适合去哪或能申请什么档次的学校，你应当主动询问并收集用户的关键背景信息（GPA、语言成绩 TOEFL/IELTS、本科专业背景、预算限制、偏好国家等），为其进行定位与录取匹配评估。
3. 探索与推荐：主动为用户发掘、科普并推荐可能适合他们、但他们目前尚未知晓的优质项目。

# 行为准则
1. 联网检索与时效性约束 (Search & Fact-Checking)：
   - 对于大学的招生要求、录取标准、截止日期等关键信息，必须通过网络检索，且必须优先采信来自学校官网（如 .edu 域名或学校官方发布渠道）的最新、可信数据。
   - 当你不确定或者需要获取最新的政策时，必须触发检索指令。输出格式为：SEARCH:[搜索词]（例如：SEARCH:[帝国理工学院计算机硕士2026年最新录取要求]）。
2. 个性化适应与学习能力 (Adaptive Learning & Memory)：
   - 密切关注并记住用户在当前会话中提到的所有背景数据、偏好和顾虑（如“更喜欢大城市”、“预算有限”、“想走学术研究路线”）。
   - 在后续的对话中，你应当不断调整你的推荐契合度，使每一次给出的方案都比上一次更契合该用户的特定习惯与特征。
3. 结构化输出与看板联动 (Structured Output)：
   - 如果用户表达了对某个项目的强烈意愿，或者你为用户推荐了具体的项目，你必须在回答的最后附加一个 JSON 数组，方便系统一键导入看板：
     RECOMMENDED_PROGRAMS:
     [{"title": "项目名称", "university_id": "大学UUID"}]
4. 文书与材料辅助管理（未来能力扩展）：
   - 你具备优秀的学术写作指导能力，随时准备在用户请求下，协助其规划、撰写和润色留学文书（如个人陈述 SoP、个人简历 CV、推荐信 LoR）以及生成自定义的申请准备进度表 (Checklist)。` 
  };
  ```

- [ ] **Step 2: Commit 代码**
  ```bash
  git add electron/main/ai_advisor.js
  git commit -m "feat: upgrade AI Advisor system prompt with professional mentor rules"
  ```

---

### Task 4: 重构 React 对话前端交互与会话状态机 (`AiAdvisorPage.jsx`)

**Files:**
*   Modify: `src/pages/AiAdvisorPage.jsx`

- [ ] **Step 1: 引入 `chatService` 服务**
  在 `src/pages/AiAdvisorPage.jsx` 顶部引入新服务：
  ```javascript
  import { chatService } from '../services/chatService';
  ```

- [ ] **Step 2: 增加会话列表与选中 ID 状态**
  在 `AiAdvisorPage` 组件内部添加状态变量：
  ```javascript
  const [sessions, setSessions] = useState([]); // 用户所有的历史会话列表
  const [currentSessionId, setCurrentSessionId] = useState(null); // 当前激活选中的会话 ID
  ```

- [ ] **Step 3: 编写加载与初始化逻辑**
  编写 `useEffect`，在用户登录后加载会话。如果没用会话，自动新建：
  ```javascript
  // 初始化载入所有历史会话列表，带详细中文注释
  useEffect(() => {
    const initSessions = async () => {
      if (!user) return;
      try {
        const data = await chatService.getSessions(user.id);
        if (data && data.length > 0) {
          setSessions(data);
          // 默认选中最新活动的第一个会话
          await handleSelectSession(data[0].id, data[0].recommended_programs || [], data);
        } else {
          // 如果数据库中完全无历史记录，则自动静默新建一个会话
          await handleNewSession();
        }
      } catch (err) {
        console.error("初始化会话列表失败:", err);
      }
    };
    initSessions();
  }, [user]);

  // 处理选中并载入具体会话的消息记录与推荐项目
  const handleSelectSession = async (sessionId, recommendedProgs = [], currentSessionsList = sessions) => {
    setCurrentSessionId(sessionId);
    setRecommended(recommendedProgs);
    setLoading(true);
    try {
      const messagesData = await chatService.getMessages(sessionId);
      if (messagesData) {
        // 过滤映射为前端组件需要的数据格式
        setMessages(messagesData.map(msg => ({ role: msg.role, content: msg.content })));
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("加载会话历史消息失败:", err);
    } finally {
      setLoading(false);
    }
  };

  // 新建咨询会话逻辑
  const handleNewSession = async () => {
    if (!user) return;
    try {
      const newSession = await chatService.createSession(user.id);
      if (newSession) {
        setSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);
        setMessages([]);
        setRecommended([]);
      }
    } catch (err) {
      console.error("创建新会话失败:", err);
    }
  };

  // 删除咨询会话逻辑
  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation(); // 阻止点击事件冒泡导致切换会话
    if (!window.confirm("确定要删除这次的咨询会话吗？（所有聊天记录和推荐列表均会丢失）")) return;
    try {
      await chatService.deleteSession(sessionId);
      const updatedSessions = sessions.filter(s => s.id !== sessionId);
      setSessions(updatedSessions);
      
      // 如果删除的是当前选中的会话，则自动切换到剩余的首个，或者创建新的
      if (currentSessionId === sessionId) {
        if (updatedSessions.length > 0) {
          await handleSelectSession(updatedSessions[0].id, updatedSessions[0].recommended_programs || [], updatedSessions);
        } else {
          await handleNewSession();
        }
      }
    } catch (err) {
      console.error("删除会话失败:", err);
    }
  };
  ```

- [ ] **Step 4: 修改消息发送逻辑**
  更新 `handleSend` 函数，在对话中实现：用户消息保存 $\rightarrow$ 智能首句自动命名 $\rightarrow$ LLM 回答 $\rightarrow$ 回答和去重推荐保存。
  ```javascript
  const handleSend = async () => {
    if (!input.trim() || !window.electronAPI || !currentSessionId) return;
    const userMessageContent = input;
    const newMsgs = [...messages, { role: 'user', content: userMessageContent }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      // 1. 将用户的提问消息保存进 Supabase 云端
      await chatService.saveMessage(currentSessionId, 'user', userMessageContent);

      // 2. 检查并处理自动智能命名：如果这是第一轮对话（标题仍是“新会话”）
      const currentSession = sessions.find(s => s.id === currentSessionId);
      if (currentSession && currentSession.title === '新会话') {
        const autoTitle = userMessageContent.length > 15 
          ? userMessageContent.substring(0, 15) + '...' 
          : userMessageContent;
        await chatService.updateSessionTitle(currentSessionId, autoTitle);
        // 更新本地会话列表的标题展示
        setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, title: autoTitle } : s));
      }

      // 3. 将包含上下文的历史对话发送给大模型处理
      const keys = apiKeysService.getKeys();
      const result = await window.electronAPI.chatWithAgent(newMsgs, keys);

      // 4. 将 AI 助手的文本回复内容保存进 Supabase 云端
      await chatService.saveMessage(currentSessionId, 'assistant', result.reply);

      // 5. 更新本地和云端推荐项目（沙箱隔离）
      let updatedRecommended = [...recommended];
      if (result.programs && result.programs.length > 0) {
        const currentIds = recommended.map(p => p.university_id);
        const newProgs = result.programs.filter(p => !currentIds.includes(p.university_id));
        updatedRecommended = [...recommended, ...newProgs];
        
        // 将合并去重后的最新推荐项目列表保存至会话行中 (JSONB)
        await chatService.updateSessionRecommendations(currentSessionId, updatedRecommended);
        // 同步更新侧边栏会话列表中的缓存数据
        setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, recommended_programs: updatedRecommended } : s));
      }

      setRecommended(updatedRecommended);
      setMessages([...newMsgs, { role: 'assistant', content: result.reply }]);

    } catch (err) {
      setMessages([...newMsgs, { role: 'assistant', content: '🚨 ' + err.message }]);
    } finally {
      setLoading(false);
    }
  };
  ```

- [ ] **Step 5: 修改 JSX 以渲染会话历史列表及其交互**
  重构左侧 `Sidebar` 部分。替换原有 Sidebar Mock 代码：
  ```jsx
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 p-6 hidden md:flex flex-col">
        <h3 className="font-bold text-slate-800 mb-6 text-lg">历史会话</h3>
        <button 
          onClick={handleNewSession}
          className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 border border-indigo-100 hover:shadow-sm"
          title="新建咨询会话"
        >
          <span>＋ 新建会话</span>
        </button>
        
        {/* 动态渲染加载出的历史会话列表 */}
        <div className="mt-8 flex-1 overflow-y-auto space-y-2 silent-scroll">
          {sessions.map(s => (
            <div 
              key={s.id}
              onClick={() => handleSelectSession(s.id, s.recommended_programs || [])}
              className={`p-3.5 rounded-2xl text-sm transition-all border cursor-pointer relative group flex justify-between items-center ${
                currentSessionId === s.id 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold shadow-sm' 
                  : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600 font-medium'
              }`}
            >
              <div className="truncate pr-4 flex-1">
                💬 {s.title}
              </div>
              <button 
                onClick={(e) => handleDeleteSession(e, s.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-200/50 transition-all font-bold"
                title="删除会话"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
  ```

- [ ] **Step 6: Commit 代码**
  ```bash
  git add src/pages/AiAdvisorPage.jsx
  git commit -m "feat: implement persistent chat UI, session switching, and delete flows"
  ```
