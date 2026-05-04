# 设计规范：寰宇之境 - 艺术地图探索

## 1. 概述
本设计规范详细说明了将“留学通”应用前端从静态双栏视图向多页面路由应用改造的过程。核心功能是将 Stitch MCP 中的“寰宇之境 - 艺术地图探索”地图 UI 整合为主要的探索门户页面。

## 2. 架构与技术栈更新
- **CSS 框架**：将 **Tailwind CSS** 集成到现有的 Vite 构建流中。
  - 添加标准的 `tailwind.config.js` 和 `postcss.config.js`。
  - 提取 Stitch 元数据中提供的自定义颜色变量，并注入到 Tailwind 配置中。
- **路由控制**：引入 **`react-router-dom`** 进行客户端路由，使用 `HashRouter`（Electron 应用的最佳实践）。

## 3. UI 组件与布局拆分

### 3.1. `MapPage.jsx`
- **用途**：新的默认主页路由 (`/`)。一个极具视觉冲击力、高互动的地图界面，允许用户按大洲探索项目。
- **实现细节**：
  - 将 Stitch 提供的 HTML 静态代码转换为干净、可复用的 React 组件。
  - 为每个大洲图标实现可点击的交互区域。
  - 保留并接入悬浮 UI 元素（如 AI 助手预览、底部统计数据栏）。

### 3.2. `ContinentPage.jsx`
- **用途**：针对特定大洲的详情视图 (路由为 `/continent/:continentId`)。
- **实现细节**：
  - 复用现有的双栏布局（左侧：`ProgramList` 项目列表，右侧：`AiAdvisorPanel` AI 顾问面板）。
  - 在头部或左上角增加一个“返回全局地图”的悬浮按钮，用于一键返回 `MapPage`。

## 4. 数据流设计
1. **地图交互**：在 `MapPage` 上点击一个大洲标记（例如北美洲），将一个新的路由路径（`/continent/north-america`）推入路由历史。
2. **数据获取**：
   - 目前阶段，`ContinentPage` 将继续从 Supabase 获取全局项目列表。
   - 未来增强功能：将 `continentId` 传递给 Supabase 查询接口，实现动态筛选。

## 5. 错误处理与边缘情况
- **未命中路由**：实现一个基础的捕获所有无效 URL 的路由（`*`），当触发无效链接时自动重定向回主页 `MapPage`。
- **Tailwind 样式冲突**：确保 Tailwind 的样式重置（Preflight）不会破坏 `ContinentPage` 中现有的基于 `index.css` 的原生样式。

## 6. 验证计划
- 确认带有 PostCSS/Tailwind 的项目能够通过 `npm run dev` 成功构建。
- 地图页面渲染正常，包含正确的样式和字体。
- 点击大洲标记可无缝导航到列表视图，无需页面重载。
- 点击返回按钮可瞬间退回地图视图。
