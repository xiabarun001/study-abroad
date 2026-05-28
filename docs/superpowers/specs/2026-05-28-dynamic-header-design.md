# 动态自适应导航栏设计规格说明书 (Dynamic Header Design Spec)

本规格说明书定义了“留学通”应用中，顶部导航栏在首页与子页面之间的自适应视觉设计与实现方案。

---

## 1. 现状与痛点 (Problem Statement)
* **痛点**：目前应用的顶部导航栏（Header）固定为亮白色背景（`bg-white/80`），而首页（`MapPage`）则是一个深色（`bg-slate-900`）的炫酷地球背景。这导致用户在首页时，顶部会有一条刺眼的白框，割裂了深色主页的沉浸感与高档感。
* **目标**：实现顶部导航栏的自适应变化。在首页时变为完全透明底+白色文字/毛玻璃微光按钮；在其他以白底为主的数据子页面时，自动变回白底黑字，从而实现无缝的奢华视觉体验。

---

## 2. 详细设计 (Detailed Design)

### 2.1 页面类型判定
在 `MainLayout.jsx` 中，使用 React Router DOM 的 `useLocation` 获取当前路径：
```javascript
const isHomepage = location.pathname === '/';
```

### 2.2 顶部栏 (`<header>`) 样式切换
* **首页模式 (`isHomepage === true`)**：
  * 背景透明，无投影，无底边框。
  * `className="fixed top-0 left-0 right-0 z-40 bg-transparent px-8 h-16 flex items-center justify-between"`
* **普通页面模式 (`isHomepage === false`)**：
  * 白色半透明毛玻璃底，带底边框和轻微投影。
  * `className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 h-16 flex items-center justify-between shadow-sm"`

### 2.3 导航栏内元素样式切换
根据 `isHomepage` 动态应用 Tailwind 类：

1. **Logo 文本 (“留学通”)**：
   * 首页：`text-white`
   * 其他：`text-slate-800`

2. **导航按钮 (“项目大全” / “申请中心” / “AI 助手”)**：
   * 激活状态：`bg-indigo-50 text-indigo-600 border-indigo-100` (不受首页影响，保持高亮)
   * 首页未激活状态（采用毛玻璃微光风格）：
     `bg-white/10 text-slate-100 border-white/10 hover:bg-white/20 hover:text-white hover:border-white/30 backdrop-blur-sm shadow-none`
   * 普通未激活状态：
     `bg-white text-slate-600 border-slate-200 hover:text-indigo-600 hover:border-indigo-200 hover:shadow shadow-sm`

3. **API 密钥设置齿轮按钮**：
   * 首页：`bg-white/10 text-slate-300 hover:text-white border-white/10 hover:border-white/30 hover:bg-white/20`
   * 其他：`bg-white text-slate-400 hover:text-indigo-600 border-slate-200 hover:border-indigo-200`

4. **登录按钮**：
   * 首页：`bg-white hover:bg-slate-100 text-slate-900 font-bold` (高对比度 CTA)
   * 其他：`bg-slate-800 hover:bg-slate-900 text-white`

5. **用户头像边框**：
   * 首页：`border-white/20`
   * 其他：`border-indigo-200`

---

## 3. 布局高度调整与自适应 (Layout Adaption)
1. **`MainLayout` 的 `<main>` 容器**：
   * 首页时**不设置** `pt-16` 内边距，使 `MapPage` 容器可以充满整个视口直达顶端。
   * 其他子页面时**设置** `pt-16`，保留原本的避空高度。
   * 样式：`className={`flex-1 w-full overflow-hidden flex flex-col relative ${isHomepage ? '' : 'pt-16'}`}`
2. **`MapPage` (首页) 最外层容器**：
   * 最外层容器高度由 `min-h-[calc(100vh-4rem)]` 变更为 `min-h-screen`。
   * 添加 `pt-16` 顶部内边距，确保背景图占满全屏的同时，内部的 Hero 文本不会被顶部的透明导航栏遮挡。

---

## 4. 验证计划 (Verification Plan)
1. **视觉检查**：
   * 启动应用，检查首页导航栏是否完全透明，文字是否为白色，按钮是否为高雅的半透明毛玻璃样式。
   * 检查首页内容排版，确保没有被顶部栏遮挡，且背景铺满顶端。
2. **切换测试**：
   * 点击“项目大全”，确认导航栏过渡为白底黑字，且 Discover 页面正常偏下对齐。
   * 切换回主页，确认导航栏顺滑变为透明。
