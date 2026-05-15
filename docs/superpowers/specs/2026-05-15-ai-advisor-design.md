# AI 申请计划生成器设计方案 (AI Plan Generator Spec)

## 1. 目标与背景 (Objective & Background)
在此前的阶段中，我们已经成功构建了“探索 -> 收藏 -> 进度跟进”的闭环，但用户在“探索”阶段仍然缺乏一个智能的私人向导。
本项目（子项目 C）旨在打造一个**支持实时联网抓取的 AI 规划师**模块，通过与用户的对话，利用搜索引擎 API 实时获取全球顶尖大学的项目要求，并为用户生成结构化的申请计划，支持一键导入到进度看板。

## 2. 界面设计与交互流 (UI & Interaction Flow)

### 2.1 独立的智能向导页面 (`/advisor`)
页面分为三个核心区域：
1. **左侧 - 历史会话 (History Sidebar)**：
   - 记录过往生成的申请计划版本（如“美国CS冲刺方案”）。
2. **中间 - 对话核心区 (Chat Interface)**：
   - 用户输入个人背景信息（GPA、语言成绩、意向专业）。
   - 展示 AI 的分析过程，特别是当 AI 进行网页抓取时，显示类似“正在搜索相关项目最新简章...”的进度提示。
   - 渲染 AI 返回的富文本回答。
3. **右侧 - 计划看板 (Plan Generation Panel)**：
   - 当 AI 完成推荐后，右侧面板会自动提取对话中的项目，生成结构化的**“待申请清单”**。
   - 每一项配有选择框和 **“一键导入看板”** 按钮。点击后，通过 `applicationService` 将选中的项目写入用户的 Kanban 看板中。

### 2.2 全局 API 设置模块
- 在设置或个人中心增加一个安全输入框，允许用户配置其专属的：
  - **LLM API Key** (如 OpenAI / DeepSeek 等)
  - **Search API Key** (如 Tavily API Key，用于实时检索)

## 3. 技术架构设计 (Technical Architecture)

### 3.1 前后端职责划分
- **React 渲染层 (Renderer)**：
  - 负责维护对话状态 (Chat History)。
  - 调用 Electron 暴露的 IPC 接口发送请求。
  - 解析 AI 返回的特定格式 JSON，用于渲染右侧的计划面板。
- **Electron 主进程层 (Main Process)**：
  - 由于避免了浏览器的跨域 (CORS) 限制，主进程将作为**智能体 (Agent)**的运行环境。
  - 使用大模型框架（如基于 API 直连），结合 Function Calling 机制触发网络搜索。
  - 返回处理好的结构化数据和对话文本给前端。

### 3.2 数据流转 (Data Flow)
1. `UI` -> `IPC (invoke)` -> `Main Process`
2. `Main Process` -> `LLM API` (判定是否需要搜网)
3. `LLM API` -> `Search API` (获取大学官网的招生要求)
4. `LLM API` -> `Main Process` (整合结果生成分析报告 + 推荐项目JSON数组)
5. `Main Process` -> `IPC (return)` -> `UI` (左侧更新对话，右侧更新推荐卡片)
6. `UI` -> `applicationService.insert` -> `Supabase Database` (导入看板)

## 4. 极端边界处理 (Edge Cases & Error Handling)
- **API 密钥未配置**：拦截请求，友善提示用户前往设置面板配置 API Key。
- **搜索超时或失败**：大模型应能基于历史知识库给出基础推荐，并提示用户网络实时抓取失败。
- **项目重复导入**：调用 `applicationService` 时需进行去重校验，防止将相同的推荐项目多次导入看板。

## 5. 待确认或调整的细节 (TBD)
- 暂时以纯前端 + Electron IPC 方式构建，不引入复杂的后端微服务，确保桌面端的独立性和响应速度。
