# 留学通 (Study Abroad) 一站式留学辅助桌面应用

“留学通” 是一款基于 **Electron**、**React 19**、**Vite** 和 **Supabase** 构建的一站式留学辅助桌面应用。它将交互式地图探索、AI 智能留学顾问、资讯网络爬虫以及申请进度追踪中心完美融合，为有留学意愿的用户提供从院校探索到申请规划的全生命周期支持。

---

## 🌟 核心特性

### 1. 🧭 交互式大洲/国家地图探索 (Global Map)
- 基于 `leaflet` 与 `react-leaflet` 绘制的全球可视化地图。
- 支持大洲 (`ContinentPage`)、国家 (`CountryPage`) 层级逐级钻取。
- 地图标记直观展示重点院校，快速查看各高校的基本概况和优势学科。

### 2. ✨ AI 智能留学顾问 (AI Study Advisor)
- **多会话管理与云端持久化**：支持用户创建、切换和删除多个独立咨询会话，会话历史与消息自动同步至云端 Supabase，提供长效记忆能力。
- **智能自动命名**：系统会根据用户发送的首条提问内容，智能截取前 15 个字作为会话标题。
- **沙箱隔离的推荐清单**：右侧 AI 推荐清单与特定会话强绑定，切换会话时自动还原对应推荐列表，防止数据交叉混淆。
- **联网事实检索**：AI 会根据提问意图自动触发 `SEARCH:[查询词]` 格式的联网指令，由后台爬虫实时获取最新招生信息，防止大模型幻觉。

### 3. 📊 留学申请中心与看板 (Application Hub)
- **可视化进度追踪**：支持用户录入心仪项目的申请流程，建立从“准备材料”到“递交申请”、“收到 Offer”的完整生命周期时间线。
- **材料准备清单 (Checklist)**：提供结构化的材料清单，确保个人陈述 (PS)、推荐信 (RL)、语言成绩等关键文书不漏缺。
- **多状态阶段扩展**：与 Supabase 紧密关联，支持多状态细分管理。

### 4. ⚡ 内存常驻与 0ms 瞬间切换 (Keep-Alive 渲染)
- 在 `MainLayout.jsx` 中，对“项目大全”、“申请中心”和“AI 助手”三个高频核心页面采用基于 CSS `hidden` 属性的常驻内存（Keep-Alive）渲染机制。
- 解决在不同路由间切换导致组件重新卸载（Unmount）、数据丢失和反复请求 Supabase 造成加载缓慢及 API 资源浪费的问题，实现丝滑切换。

---

## 🛠️ 技术栈

### 前端与渲染进程 (Renderer Process)
*   **核心框架**：React 19.0.0
*   **路由管理**：React Router DOM v7.14.0
*   **样式体系**：Tailwind CSS 3.4.0 (支持首页玻璃摩砂质感、多态阴影及微动画)
*   **地图渲染**：Leaflet 1.9.0 + React Leaflet 5.0.0
*   **国际化 (i18n)**：i18next + react-i18next (中英文即时切换)

### 桌面外壳与主进程 (Main Process)
*   **桌面框架**：Electron 41.2.0
*   **进程通信**：Context Bridge 安全上下文隔离与 IPC 异步管道
*   **网页爬虫**：Cheerio 1.2.0 + RSS Parser 3.13.0 (用于新闻资讯抓取与项目参数结构化提取)

### 数据存储与同步 (Databases)
*   **本地缓存库**：SQLite (`better-sqlite3` v12.8.0)
    *   主要用于存储本地爬取到的留学资讯文章（`articles`）与 RSS 数据源（`sources`）。
*   **云端数据库**：Supabase (`@supabase/supabase-js` v2.105.0)
    *   保存用户注册/登录凭证、申请追踪、收藏夹、以及 AI 会话与消息历史。
    *   通过 RLS (行级安全策略) 实现多用户之间的数据绝对物理隔离。

---

## 📁 目录结构

```text
study-abroad/
├── .env.local             # 本地环境变量 (Supabase 凭证)
├── .env.example           # 环境变量模板
├── package.json           # 项目配置与依赖管理
├── vite.config.js         # Vite 构建配置
├── tailwind.config.js     # Tailwind 样式定制
├── electron/              # Electron 主进程代码
│   ├── main.js            # Electron 主进程入口
│   ├── preload.js         # 安全预加载脚本 (IPC API 注入)
│   ├── db.js              # 本地 SQLite 初始化与表定义
│   ├── scraper.js         # 资讯爬虫与项目数据抓取工具
│   └── main/              # 存放主进程核心业务逻辑 (如 ai_advisor)
├── supabase/              # Supabase 数据库配置文件
│   ├── seed.sql           # 初始种子数据
│   └── migrations/        # 数据库迁移脚本目录 (表结构、RLS 策略)
├── docs/                  # 需求规格书与设计文档
│   └── superpowers/       # 各大特色功能的设计文档 (plans & specs)
└── src/                   # React 渲染进程代码
    ├── main.jsx           # 渲染进程入口
    ├── App.jsx            # 路由网关与事件监听
    ├── index.css          # 全局样式与自定义动效
    ├── layouts/           # 页面布局模板 (如常驻 Keep-Alive 设计的 MainLayout)
    ├── pages/             # 视图页面组件 (AI 顾问、申请中心、地图、大学详情等)
    ├── components/        # 公共 UI 组件 (登录弹窗、API 密钥弹窗等)
    ├── services/          # 业务逻辑服务层 (Supabase 增删改查、认证、收藏等)
    ├── shared/            # 跨页面共享的工具与客户端实例
    └── i18n.js            # 国际化多语言配置文件
```

---

## 💾 数据库设计

### 1. 本地 SQLite 缓存表 (`electron/db.js`)
*   `articles`：缓存抓取来的留学资讯，包含标题、链接、发布源、国家、大学及缩略图。
*   `sources`：存储资讯的 RSS 数据源，包含名称、链接、类型、归属大学/国家及是否启用。

### 2. 云端 Supabase 数据表
项目数据库的变更以迁移脚本管理，核心表结构包含：
*   `chat_sessions`：AI 聊天会话表，支持绑定 `user_id`，并使用 `JSONB` 存储特定会话的推荐项目清单。
*   `chat_messages`：AI 聊天消息历史表，保存对话上下文（支持 `user`、`assistant`、`system` 角色）。
*   `applications` & `application_steps`：申请追踪核心表，管理申请学校、专业、当前阶段和代办任务清单。
*   `favorites`：用户收藏的院校和留学项目。

> [!IMPORTANT]
> **行级安全策略 (RLS)**：Supabase 中所有涉及个人数据的表（如会话、消息、收藏、申请）都启用了 RLS，只允许操作者读写属于自己账户的数据：
> `USING (auth.uid() = user_id)`

---

## ⚙️ 本地开发运行指南

### 1. 环境准备
确保您的本地开发环境已安装了 [Node.js](https://nodejs.org/) (建议 v18+)。

### 2. 克隆并安装依赖
```bash
# 安装依赖 (包括 Electron, React, SQLite 等)
npm install
```

### 3. 配置环境变量
在项目根目录下创建 `.env.local` 文件，并填写您的 Supabase 项目地址与 APIAnon Key（可参考 `.env.example`）：
```properties
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-string
```

### 4. 运行项目
项目采用 `concurrently` 同时启动前端 Vite 热更新服务器与 Electron 桌面客户端。执行以下命令即可启动开发模式：
```bash
npm run dev
```

### 5. 项目构建 (打包)
```bash
# 编译前端静态资源
npm run build
```

---

## 🔌 IPC 渲染进程接口说明 (Bridge API)

Electron 在 `electron/preload.js` 中通过 `contextBridge.exposeInMainWorld` 暴露了 `electronAPI` 对象，前端 React 通过 `window.electronAPI` 可直接调用以下方法进行跨进程交互：

```javascript
// React 端调用示例中添加中文注释：

// 1. 获取本地 SQLite 中缓存的资讯文章列表
window.electronAPI.getArticles().then(articles => {
  console.log('获取到的文章：', articles);
});

// 2. 强行抓取指定 URL 页面
window.electronAPI.forceScrape('https://example.com/news');

// 3. 与 AI 留学顾问开始进行对话 (支持历史上下文传入)
window.electronAPI.chatWithAgent(messages, apiKeys, options);

// 4. 监听 AI 输出的流式数据片段 (Chunk)
const removeChunkListener = window.electronAPI.onAgentChunk((chunk) => {
  console.log('流式文本片段：', chunk);
});
// 在组件卸载时调用 removeChunkListener() 取消监听以防止内存泄漏

// 5. 监听 AI 顾问的执行状态 (如正在搜索、正在分析等)
const removeStatusListener = window.electronAPI.onAgentStatus((status) => {
  console.log('当前智能体状态：', status);
});
```

---

## 🛡️ 开发规范与贡献注意事项
1. **类型安全**：在编写底层 API 和服务调用时，避免使用隐式类型转换，保证核心交互的可靠性。
2. **异常捕获**：在 IPC 调用与 Supabase 服务请求中，务必包裹完整的 `try-catch` 或 `.catch`，防范应用发生崩溃。
3. **性能注意**：对于高频切换的核心视图，优先通过 `MainLayout` 的常驻显示状态（如 CSS `hidden` 属性）来保存用户操作进度与路由状态，而不是反复销毁与重建组件。
