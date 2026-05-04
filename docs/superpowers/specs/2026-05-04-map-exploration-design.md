# Design Spec: Horizon Ethos Map Exploration

## 1. Overview
This design specification details the transformation of the Study Abroad Application frontend from a static dual-column view into a multi-page routing application. The core feature is integrating the Stitch MCP "寰宇之境 - 艺术地图探索" map UI as the primary exploration portal.

## 2. Architecture & Tech Stack Updates
- **CSS Framework**: Integrate **Tailwind CSS** into the existing Vite build pipeline. 
  - Add standard `tailwind.config.js` and `postcss.config.js`.
  - Extract and inject custom color variables provided by the Stitch metadata into the Tailwind configuration.
- **Routing**: Introduce **`react-router-dom`** for client-side routing using `HashRouter` (best practice for Electron apps).

## 3. UI Components & Layouts

### 3.1. `MapPage.jsx`
- **Purpose**: The new default route (`/`). A visually stunning, interactive map interface allowing users to explore programs by continent.
- **Implementation**:
  - Convert the Stitch HTML code into a clean, reusable React component.
  - Implement interactive clickable areas for each continent marker.
  - Retain the floating UI elements (AI Assistant preview, quick stats footer).

### 3.2. `ContinentPage.jsx`
- **Purpose**: A dedicated view for a specific continent (route `/continent/:continentId`).
- **Implementation**:
  - Re-use the existing dual-column layout (left: `ProgramList`, right: `AiAdvisorPanel`).
  - Add a "Back to Global Map" floating button in the header or top-left corner to return to the `MapPage`.

## 4. Data Flow
1. **Map Interaction**: Clicking a continent marker (e.g., North America) on the `MapPage` pushes a new route (`/continent/north-america`) to the router history.
2. **Data Fetching**: 
   - Currently, `ContinentPage` will continue to fetch the global list from Supabase. 
   - Future enhancement: Pass the `continentId` to the Supabase fetch query to filter results dynamically.

## 5. Error Handling & Edge Cases
- **Missing Routes**: Implement a basic catch-all route (`*`) that redirects back to the main `MapPage` if an invalid URL is triggered.
- **Tailwind Conflicts**: Ensure Tailwind's preflight resets do not destructively break the existing `index.css` vanilla styles used in the `ContinentPage`.

## 6. Verification
- `npm run dev` builds successfully with PostCSS/Tailwind.
- Map renders with correct styles and fonts.
- Clicking a continent navigates to the list view without page reload.
- The back button returns the user to the map view instantly.
