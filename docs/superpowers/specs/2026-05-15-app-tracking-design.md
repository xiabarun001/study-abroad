# Sub-project B: Application Tracking System Design

## 1. Overview
The second sub-project addresses the problem of messy application management. We are building a Kanban-style Application Tracking System that includes timeline-based deadline reminders. This allows users to promote their favorited programs into actual applications and track their progress through various stages.

## 2. Architecture & Database Schema
We will create a new table `user_applications` linked to `auth.users` and `programs`. A SQL migration script will be provided.

### 2.1 New Tables
- **`user_applications`**
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users.id)
  - `program_id` (uuid, foreign key to programs.id)
  - `status` (text, constraints: 'planning', 'preparing', 'submitted', 'waiting', 'result')
  - `deadline` (date, nullable)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
  - *Constraint*: Unique combination of `(user_id, program_id)` to prevent duplicate application tracking.

### 2.2 Row Level Security (RLS)
- Enable RLS on `user_applications`.
- Create policies allowing users to `SELECT`, `INSERT`, `UPDATE`, and `DELETE` only their own records (`auth.uid() = user_id`).

## 3. Frontend Components & Views

### 3.1 Application Service (`applicationService.js`)
- Fetch applications for the current user.
- Update application status and deadline.
- Create new application from a favorite.

### 3.2 Main Layout Updates (`MainLayout.jsx`)
- Add "我的申请" (My Applications) to the global header navigation for logged-in users.

### 3.3 Favorites Page Integration (`FavoritesPage.jsx`)
- Add a "启动申请" (Start Application) button to each favorited program card.
- Clicking this inserts a new record into `user_applications` with status 'planning' and transitions the user to the Applications page, or shows a success toast.

### 3.4 Applications Page (`ApplicationsPage.jsx`)
- **Top Section (Urgent Timeline)**:
  - Filters applications with a `deadline` within the next 14 days and status not in ('result').
  - Displays urgent alerts using a highly visible UI component.
- **Bottom Section (Kanban Board)**:
  - Defines 5 columns: 规划中 (Planning), 准备材料 (Preparing), 已提交 (Submitted), 面试/等待 (Waiting), 结果 (Result).
  - Renders application cards in their respective columns.
  - Each card shows program name, university, and deadline.
  - A dropdown menu on each card allows changing its status to move it between columns.
  - Clicking the deadline date allows setting/updating the date.

## 4. Verification Plan
- Run SQL migration and ensure RLS works correctly.
- Go to Favorites, click "Start Application", verify the program appears in the Applications page.
- Change the status of a program and ensure it moves to the correct column and persists on reload.
- Set a deadline within 14 days and ensure it appears in the urgent timeline.
