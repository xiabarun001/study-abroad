# 设计规范: Study-abroad 留学新闻抓取桌面应用

## 1. 项目主旨 (Project Context)
本软件是一个适用于 64 位 Windows 11 操作系统的独立桌面端软件。其核心目标是每日自动收集国内外的重点留学新闻，并按“国家”和“大学”进行网格化的分类展示，让用户能直观、高效地阅读天下留学动态。

## 2. 架构体系与技术选型 (Architecture & Tech Stack)
*   **软件形态**: 独立原生桌面软件 (打包为 .exe 安装包)。
*   **底层架构**: **Electron** (内嵌了 Chromium 与 Node.js)。
*   **前端框架**: **React** (由于用户选定) + Vite (极速构建) + Vanilla CSS (配合 Windows 11 Fluent 风格设计)。
*   **本地存储**: 采用轻量级本地文件存储或 SQLite 以缓存新闻和订阅源，确保纯脱机也能浏览已有新闻。

## 3. UI 界面布局 (UI & Layout)
采用 **C. 仪表盘网格 (Dashboard Grid)** 设计。
1.  **首页看板 (Dashboard)**: 新闻流卡片平铺，一目了然获取最新信息，具备强烈的视觉冲击。
2.  **侧边/顶部过滤 (Filter)**: 方便地根据“国家”（如：英国、美国等）和“大学”（如：剑桥大学、哈佛大学等）分类过滤新闻卡片。
3.  **配置中心 (Settings)**: 可视化的订阅源和抓取任务管理面板。

## 4. 数据获取与后端逻辑 (Data Acquisition Engine)
由于 Electron 自带 Node.js（主进程），本软件**无需额外的云端后端服务器**。所有的后端逻辑和数据抓取操作都在用户的本机静默完成：
*   **混合智能模式 (Hybrid Engine)**:
    *   **核心内置爬虫 (Built-in Scrapers)**: 我们将在 Node.js 主进程中内置 cheerio 或 puppeteer 等爬虫脚本，每天定时请求预设的名校官网和资讯网，提取 HTML 中的新闻标题、日期和缩略图。
    *   **RSS 订阅驱动 (RSS Parser)**: 内置 ss-parser 模块，用户可以在“配置中心”通过粘贴第三方新闻源的 XML 链接进行信息订阅补充。
*   **定时任务**: 主进程中设置 Cron 任务（如每天早晨 8 点自动触发收集任务），通过网络获取新数据后追加到本地库中。

## 5. 工作流 (Workflow)
由 React 获取 UI 并向 Electron Main Process（主进程）发起 IPC（进程间通信）请求读取今日新闻。主进程通过读取 SQLite 数据库，然后把结果发送回 React 渲染到 Dashboard 上。
