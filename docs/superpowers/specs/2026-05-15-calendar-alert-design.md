# 死线日历与预警系统设计方案 (Deadline Calendar & Alert Spec)

## 1. 目标与背景 (Objective & Background)
在此前阶段中，系统已经具备了以 Kanban 为核心的申请追踪模块。但申请流程中，用户对时间敏感度极高，纯卡片流较难直观展现项目截止日期的密度和急迫性。
本项目（子项目 D）旨在为“我的申请”页面增加平滑切换的日历视图，并通过非侵入式的视觉高亮机制，自动提醒用户近期即将到期的重要任务。

## 2. 界面设计与交互流 (UI & Interaction Flow)

### 2.1 视图切换控制器 (View Toggle)
- 在 `ApplicationsPage.jsx` 的页面 Header 区域（“我的申请”标题右侧），放置一个 Segmented Control（如：`看板 | 日历` 按钮组）。
- 点击切换时，下方的组件平滑更替，不触发路由刷新，保证体验流畅。

### 2.2 月度日历组件 (Monthly Calendar Grid)
- **原生实现**：不引入庞大第三方包，利用标准 JS Date API 渲染当月每一天。顶部支持“上个月 / 本月 / 下个月”的快速切换。
- **数据映射**：读取共享的 `applications` 状态，对所有包含 `deadline` 字段的项目，将其映射渲染到对应的日期格内。
- **条带设计 (Pill)**：
  - 日历格内的项目呈现为一个小巧的条带。
  - 条带底色与看板状态一致（例如 `planning` 为蓝色，`submitted` 为绿色）。

### 2.3 轻量级预警机制 (Visual Alert)
- **判定逻辑**：
  - 条件 1：当前申请的状态为“未提交”（如 `planning` 或 `preparing`）。
  - 条件 2：其 `deadline` 与当前自然日的差值 $\le 7$ 天（且 $\ge 0$ 天）。
- **视觉呈现**：
  - 符合判定条件的项目，在其 Kanban 卡片及日历的 Pill 条带上，额外添加一圈**红色的发光边框 (ring-red-500)**。
  - 条带旁可显示一个小巧的 ⚠️ 图标。
  - 这避免了强打扰的 OS 弹窗，将危机感内化在日常查看中。

## 3. 技术实现方案 (Technical Implementation)

### 3.1 状态管理改造
- 将 `ApplicationsPage.jsx` 中原本写死在 `renderKanban()` 内的逻辑拆分。
- 引入当前激活视图状态：`const [activeView, setActiveView] = useState('kanban')`。
- 新建子组件 `ApplicationCalendar.jsx` 负责渲染日历。`ApplicationsPage` 负责统筹并向下传递 `applications`, `handleStatusChange` 等 Props。

### 3.2 日历计算核心逻辑
```javascript
// 获取当月所有日期的辅助函数示例
const getDaysInMonth = (year, month) => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};
```
- 需要同时计算该月 1 号之前的空白垫片（Padding Days），以保证星期的完美对齐。

## 4. 极端边界处理 (Edge Cases)
- **跨月与跨年**：翻页功能必须能准确处理 12月到1月、平年闰年的跳转。
- **缺失 Deadline**：如果某项目未设置 `deadline`（比如默认留空），则它**不会**出现在日历中，仅保留在看板的 Unscheduled 区域，且不会触发 7 天预警。
- **同一天多任务**：日历格子需要具备 `overflow-y-auto` 或 `max-h`，防止某一天挤入过多项目撑爆整体布局。

## 5. TBD
- （暂无，架构明确）
