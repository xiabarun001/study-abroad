# 留学申请中心 (Application Hub) 设计文档

本文档定义了“留学申请中心”门户页面的架构、数据流与界面设计规格。

## 1. 功能概述

“申请中心” (Application Hub) 作为一个独立的综合仪表盘 (Dashboard) 页面，为用户提供留学的全局申请状态与心仪大学的管理入口。主要功能包括：
1. **申请状态大盘统计**：展示进行中申请、已获 Offer 数量、已收藏项目数量，并支持点击快速跳转。
2. **临近截止时间提醒**：自动提取 7 天内即将截止的申请记录并红色高亮预警。
3. **最新收藏快速启动**：展示最近收藏的 3 个项目，并支持一键将其加入申请看板。
4. **进度状态扩展**：将系统的 5 个状态拓展为 7 个状态，提供更精细的流程追踪。

---

## 2. 架构与路由设计

### 2.1 路由配置 (`src/App.jsx`)
新增 `/hub` 路由，并调整现有的侧边栏导航：
*   **[新增]** `/hub` -> 对应新建 of `ApplicationHubPage.jsx`。
*   **[保留]** `/favorites` -> 对应已有的 `FavoritesPage.jsx`。
*   **[保留]** `/applications` -> 对应已有的 `ApplicationsPage.jsx`。

### 2.2 导航配置
在侧边栏导航中，合并原有的“我的收藏”和“我的申请”，统一替换为“**申请中心**” (链接到 `/hub`)。在申请中心页中提供明确的按钮跳转到详细看板和收藏夹。

---

## 3. 数据库与状态变动

### 3.1 状态阶段扩充
全局状态从原有的 5 个升级为 7 个：
1.  `planning` (规划中)
2.  `preparing` (准备材料中)
3.  `supplement` (补充材料中) - **[新增]**
4.  `submitted` (已提交)
5.  `waiting` (面试/等待)
6.  `offer` (已获录取/Offer) - **[新增]**
7.  `rejected` (已拒绝) - **[新增]**

### 3.2 数据库迁移脚本 (Supabase)
需要在 Supabase 控制台的 SQL Editor 中执行以下脚本，以修改数据库中的 CHECK 约束：

```sql
-- 1. 尝试删除已有的 status 字段约束（PostgreSQL 自动生成的约束名通常为 user_applications_status_check）
ALTER TABLE public.user_applications 
DROP CONSTRAINT IF EXISTS user_applications_status_check;

-- 2. 重新添加支持 7 个新状态的约束（同时保留旧的 'result' 作为向后兼容）
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

-- 3. 将已有数据中所有的 'result' 状态一律迁移为 'offer' 状态
UPDATE public.user_applications 
SET status = 'offer' 
WHERE status = 'result';
```

---

## 4. UI 界面布局与交互

### 4.1 页面主视觉
*   **背景风格**：采用淡雅的毛玻璃质感与渐变色：`bg-gradient-to-br from-slate-50 via-indigo-50/20 to-sky-50/30`。
*   **字体布局**：现代圆润的 UI 组件，辅以平滑的过渡动画。

### 4.2 卡片区域设计
1.  **数据看板组 (Grid 3等分)**：
    *   **进行中**：过滤出 `planning, preparing, supplement, submitted, waiting` 的记录总数。
    *   **已获 Offer**：过滤出 `offer` 的记录总数。
    *   **我的收藏**：关联 `favoriteService` 读出用户的收藏总数。
    *   *Hover效果*：`hover:scale-105 hover:shadow-xl transition-all duration-300` 并伴有微光闪烁。
2.  **紧急任务列 (Upcoming Deadlines)**：
    *   展示最近 7 天内截止的申请。
    *   如果截止日期小于等于 2 天，倒计时徽章使用红色闪烁动画 (`animate-pulse`)。
3.  **快捷启动收藏 (Recent Favorites)**：
    *   提取最新 3 条收藏记录。
    *   包含“🚀 启动申请”按钮。点击后，通过 `applicationService.createApplication` 在数据库中插入记录（默认状态为 `planning`），并展示跳转看板的成功通知。

---

## 5. 错误处理与容错

1.  **数据库约束容错**：如果 Supabase 端的 CHECK 约束尚未成功升级，用户在看板或中心执行状态变更至新阶段时，接口会拦截 `400/23514` 错误码（CHECK violation），并在前端弹出友好提示，告知用户检查数据库约束。
2.  **空白状态保护 (Empty State)**：当没有收藏记录或紧急截止日期时，不展示空白列表，而是呈现精美的插图与“立即去探索大学”的引导按钮。

---

## 6. 测试与验证计划

### 6.1 手动测试用例
1.  **状态流转测试**：拖动看板卡片到新阶段（如“补充材料”、“已获 Offer”），刷新页面后状态依然正确保存。
2.  **一键申请测试**：在“申请中心”点击“启动申请”后，大盘的“进行中”计数应即时 +1，且能顺利跳转至申请看板的“规划中”列。
3.  **倒计时报警测试**：设置一个 2 天后截止的申请项目，进入申请中心，确认有醒目的红色 `animate-pulse` 报警徽章。
