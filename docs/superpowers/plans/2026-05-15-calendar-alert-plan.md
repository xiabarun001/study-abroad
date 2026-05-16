# Deadline Calendar & Alert Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a toggleable monthly calendar view to the Applications page, and implement a visual alert (red highlight) for applications with deadlines <= 7 days away.

**Architecture:** 
- `ApplicationsPage.jsx` will manage state (`apps`, `activeView`).
- `ApplicationKanban.jsx` will handle the board view (extracted from the current page).
- `ApplicationCalendar.jsx` will handle the monthly grid view.
- A visual alert logic will be shared to highlight cards/pills in both views.

**Tech Stack:** React, plain JavaScript Date API (no heavy dependencies).

---

### Task 1: Refactor ApplicationsPage & Extract Kanban

**Files:**
- Create: `src/components/ApplicationKanban.jsx`
- Modify: `src/pages/ApplicationsPage.jsx`

- [ ] **Step 1: Create ApplicationKanban.jsx**
Extract the Kanban rendering part into a component.

- [ ] **Step 2: Update ApplicationsPage.jsx**
Modify the page to manage `activeView` and render the Segmented Control.

---

### Task 2: Create ApplicationCalendar Component

**Files:**
- Create: `src/components/ApplicationCalendar.jsx`

- [ ] **Step 1: Write ApplicationCalendar.jsx**
A month-view calendar using `Date`.
