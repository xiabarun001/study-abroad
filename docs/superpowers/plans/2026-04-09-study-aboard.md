# Study-abroad Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Build a Windows 11 standalone desktop app that automatically collects and displays international study-abroad news in a dashboard grid, using embedded SQLite for offline capabilities.

**Architecture:** Electron desktop app with a Vite/React frontend. The Node.js Main Process acts as the local backend running scheduled Cron jobs (using cheerio/rss-parser) to scrape and store data into a local SQLite database. The frontend requests data via Electron IPC bridges.

**Tech Stack:** Electron, React, Vite, Vanilla CSS, SQLite (better-sqlite3), cheerio, rss-parser.

---

### Task 1: Project Scaffolding (Electron + Vite + React)

**Files:**
- Create: package.json
- Create: ite.config.js
- Create: electron/main.js
- Create: electron/preload.js
- Create: index.html
- Create: src/main.jsx
- Create: src/App.jsx

- [ ] **Step 1: Initialize project & dependencies**
Run: 
pm init -y
Run: 
pm install react react-dom electron-squirrel-startup better-sqlite3 cheerio rss-parser
Run: 
pm install -D electron vite @vitejs/plugin-react concurrently wait-on cross-env

- [ ] **Step 2: Configure scripts in package.json**
Add simple dev scripts to launch vite and electron simultaneously using concurrently.

- [ ] **Step 3: Setup basic React App files**
Implement index.html, src/main.jsx, src/App.jsx with a "Hello Study-abroad" placeholder. Implement ite.config.js.

- [ ] **Step 4: Setup Electron main and preload scripts**
Implement electron/main.js to create standard BrowserWindow, pointing to Vite's dev server (http://localhost:5173). Setup basic safe electron/preload.js with contextBridge.

- [ ] **Step 5: Run to verify scaffolding**
Run: 
pm run dev
Expected: Software opens a window displaying the React component.

- [ ] **Step 6: Commit**

### Task 2: Database Initialization (SQLite)

**Files:**
- Create: electron/db.js
- Test: 	ests/db.test.js

- [ ] **Step 1: Write test for db init**
Assert that initDb() creates a data.sqlite with the necessary tables (rticles, sources).

- [ ] **Step 2: Write minimal implementation**
Implement db.js using etter-sqlite3 to ensure the file exists in the user's ppData folder (or project root in dev) and execute CREATE TABLE IF NOT EXISTS for articles.

- [ ] **Step 3: Run to verify**
Execute the test to ensure DB is created.

- [ ] **Step 4: Commit**

### Task 3: Data Scraper Engine (Main Process)

**Files:**
- Create: electron/scraper.js
- Modify: electron/main.js

- [ ] **Step 1: Implement RSS Parser**
Write a function etchRSS(url) using ss-parser to collect articles and insert them into the DB table.

- [ ] **Step 2: Implement built-in cheerio Scraper**
Write a function etchUniversityWeb(url) using cheerio to fetch one target standard university page and insert findings into DB.

- [ ] **Step 3: IPC Bridge integration**
Expose IPC handlers in main.js: getArticles, orceScrape.
Wire them in preload.js via contextBridge.

- [ ] **Step 4: Test scraper manually**
Run the force scrape IPC and query the DB.

- [ ] **Step 5: Commit**

### Task 4: UI Dashboard Grid

**Files:**
- Modify: src/App.jsx
- Create: src/components/DashboardGrid.jsx
- Create: src/components/ArticleCard.jsx
- Create: src/index.css

- [ ] **Step 1: Setup Vanilla CSS Theme**
Implement basic Win11 styling variables (rounded corners, box-shadows, grid layouts) in index.css.

- [ ] **Step 2: Construct ArticleCard**
Implement static ArticleCard receiving props: title, url, source, date.

- [ ] **Step 3: Construct DashboardGrid & Data passing**
In App.jsx, call window.electronAPI.getArticles() to fetch from SQLite. Pass the state down to DashboardGrid and map over ArticleCards.

- [ ] **Step 4: Run to verify**
Launch 
pm run dev, verify that the data successfully flows from Node SQLite -> IPC -> React UI in a grid layout.

- [ ] **Step 5: Commit**
