# Sub-project A: Favorites & Auth Design

## 1. Overview
This is the first sub-project to address the user's need for application tracking. We are implementing a foundational authentication system and a "favorites" feature that allows users to save study-abroad programs they are interested in.

## 2. Architecture & Database Schema
We will leverage Supabase's built-in Auth and add a new table for favorites. A SQL script will be provided for the user to execute manually in the Supabase SQL Editor.

### 2.1 New Tables
- **`user_favorites`**
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users.id)
  - `program_id` (uuid, foreign key to programs.id)
  - `created_at` (timestamp)
  - *Constraint*: Unique combination of `(user_id, program_id)`

### 2.2 Row Level Security (RLS)
- Enable RLS on `user_favorites`.
- Create a policy allowing users to `SELECT`, `INSERT`, and `DELETE` only their own records (`auth.uid() = user_id`).

## 3. Frontend Components & Views

### 3.1 Auth Provider Context
- Create an `AuthProvider` context in React to manage the current session state and user data (`src/hooks/useAuth.jsx` or similar).

### 3.2 Login Modal Component (`LoginModal.jsx`)
- A Glassmorphism modal with Email and Password fields.
- Supports both "Sign Up" and "Log In" modes.
- Uses `supabase.auth.signUp` and `supabase.auth.signInWithPassword`.

### 3.3 Header Component (`Header.jsx` or `MainLayout.jsx`)
- Check auth state.
- If logged out: Show "登录" (Login) button which triggers the modal.
- If logged in: Show "我的收藏" (My Favorites) link/button and a "登出" (Logout) button.

### 3.4 Like Button Component (`FavoriteButton.jsx`)
- A reusable heart icon button.
- Props: `program_id`.
- Logic: Queries `user_favorites` on load to determine active state. Clicking toggles the state via Supabase insert/delete.
- If not logged in: Clicking triggers the `LoginModal`.

### 3.5 Favorites Page (`FavoritesPage.jsx`)
- Accessible only when logged in (redirects or shows login prompt if not).
- Queries `user_favorites` joined with `programs`.
- Displays a grid of program cards that the user has saved.

## 4. Services Layer Updates
- **`authService.js`**: Wrap Supabase auth functions (login, register, logout, session).
- **`favoriteService.js`**: Wrap Supabase queries for `user_favorites` (toggleFavorite, checkIsFavorite, getFavoritesByUser).

## 5. Verification Plan
- Run the SQL script in Supabase and ensure RLS works correctly.
- Test user registration and login flow.
- Ensure the heart icon correctly reflects the saved state and persists across page reloads.
- Verify the Favorites page accurately lists only the logged-in user's saved programs.
