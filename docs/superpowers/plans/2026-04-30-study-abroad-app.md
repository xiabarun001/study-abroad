# Study Abroad Recommendation App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a zero-cost desktop application that allows users to scrape study abroad programs, view them via a shared cloud database, receive AI recommendations, and apply directly via an in-app browser.

**Architecture:** We are using an Electron + React desktop application with a Feature-Based module structure. Data is stored remotely in Supabase to enable sharing among friends, while scraping and AI querying happen locally to eliminate server costs.

**Tech Stack:** Electron, React 19, Vite, Supabase (PostgreSQL), better-sqlite3 (local cache), cheerio/rss-parser (scraping).

---

### Task 1: Project Restructure & Main Core Initialization

**Files:**
- Create: `electron/main/core.js`
- Modify: `electron/main.js:1-50`
- Create: `src/shared/utils/ipc.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/electron/core.test.js
const { initCore } = require('../../electron/main/core');
describe('Core Init', () => {
  it('should export initCore function', () => {
    expect(typeof initCore).toBe('function');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/electron/core.test.js`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write minimal implementation**

```javascript
// electron/main/core.js
function initCore(app, BrowserWindow) {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  return mainWindow;
}
module.exports = { initCore };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/electron/core.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/electron/core.test.js electron/main/core.js
git commit -m "feat(core): initialize electron main window module"
```

### Task 2: Supabase Database Connection

**Files:**
- Create: `src/shared/db/supabase.js`
- Create: `tests/shared/supabase.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/shared/supabase.test.js
import { supabase } from '../../src/shared/db/supabase';
describe('Supabase Client', () => {
  it('should initialize supabase client', () => {
    expect(supabase).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test tests/shared/supabase.test.js`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```javascript
// src/shared/db/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:8000';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test tests/shared/supabase.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/shared/db/supabase.js tests/shared/supabase.test.js
git commit -m "feat(db): setup supabase client connection"
```

### Task 3: Local Scraper Engine Integration

**Files:**
- Create: `electron/main/scraper.js`
- Create: `tests/electron/scraper.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/electron/scraper.test.js
const { scrapeUniversityPage } = require('../../electron/main/scraper');
describe('Scraper Engine', () => {
  it('should return mock HTML parsing result', async () => {
    const result = await scrapeUniversityPage('<html><body><h1>Harvard</h1></body></html>');
    expect(result.title).toBe('Harvard');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test tests/electron/scraper.test.js`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```javascript
// electron/main/scraper.js
const cheerio = require('cheerio');

async function scrapeUniversityPage(htmlString) {
  const $ = cheerio.load(htmlString);
  return {
    title: $('h1').text().trim()
  };
}

module.exports = { scrapeUniversityPage };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test tests/electron/scraper.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add electron/main/scraper.js tests/electron/scraper.test.js
git commit -m "feat(scraper): implement basic cheerio HTML parsing"
```

### Task 4: In-App BrowserView Manager

**Files:**
- Create: `electron/main/webview.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/electron/webview.test.js
const { createBrowserView } = require('../../electron/main/webview');
describe('Webview Manager', () => {
  it('should export createBrowserView', () => {
    expect(typeof createBrowserView).toBe('function');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test tests/electron/webview.test.js`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```javascript
// electron/main/webview.js
const { BrowserView } = require('electron');

function createBrowserView(mainWindow, url) {
  const view = new BrowserView();
  mainWindow.setBrowserView(view);
  view.setBounds({ x: 0, y: 50, width: 1200, height: 750 });
  view.webContents.loadURL(url);
  return view;
}

module.exports = { createBrowserView };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test tests/electron/webview.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add electron/main/webview.js tests/electron/webview.test.js
git commit -m "feat(webview): add utility to open external application sites"
```

### Task 5: Feature - Program Catalog UI

**Files:**
- Create: `src/features/catalog/ProgramList.jsx`
- Create: `tests/features/catalog/ProgramList.test.jsx`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/features/catalog/ProgramList.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgramList } from '../../../src/features/catalog/ProgramList';

describe('ProgramList UI', () => {
  it('renders a list of programs', () => {
    const mockPrograms = [{ id: 1, name: 'MS Computer Science' }];
    render(<ProgramList programs={mockPrograms} />);
    expect(screen.getByText('MS Computer Science')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test tests/features/catalog/ProgramList.test.jsx`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```javascript
// src/features/catalog/ProgramList.jsx
import React from 'react';

export function ProgramList({ programs }) {
  return (
    <div className="program-list">
      {programs.map(p => (
        <div key={p.id} className="program-card">{p.name}</div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test tests/features/catalog/ProgramList.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/catalog/ProgramList.jsx tests/features/catalog/ProgramList.test.jsx
git commit -m "feat(catalog): create program list UI component"
```
