# Continent and Country Hierarchy Design

## 1. Overview
The goal of this project is to replace the current map-based homepage with a cleaner, hierarchical navigation structure for exploring study-abroad options. The new flow will be: Homepage (Continents) -> Continent Page (Countries) -> Country Page (Universities).

## 2. Architecture & Database Schema
We will use Supabase as the backend. A SQL script will be provided to the user to execute manually in the Supabase SQL Editor.

### 2.1 New Tables
- **`continents`**
  - `id` (uuid, primary key)
  - `name` (text)
  - `slug` (text, unique)
  - `cover_image` (text)
  - `created_at` (timestamp)

- **`countries`**
  - `id` (uuid, primary key)
  - `continent_id` (uuid, foreign key to continents.id)
  - `name` (text)
  - `slug` (text, unique)
  - `cover_image` (text)
  - `created_at` (timestamp)

### 2.2 Table Modifications
- **`universities`**
  - Add `country_id` (uuid, foreign key to countries.id, nullable for backward compatibility during migration).

## 3. Frontend Components & Views

### 3.1 Home Page (replaces MapPage.jsx)
- Remove `react-leaflet` and map dependencies from the component.
- **Header Section:** Display 1-2 large promotional images (Banner/Carousel).
- **Continents Section:** A CSS Grid layout (e.g., 2-column or 3-column) displaying continent cards. Each card will have a background image, the continent's name, and a click handler navigating to `/continent/:continentId`.

### 3.2 Continent Page (ContinentPage.jsx)
- Retrieve `continentId` from the URL.
- Fetch all countries where `continent_id` matches the current continent.
- Display a grid of Country cards. Clicking a card navigates to `/country/:countryId`.

### 3.3 Country Page (CountryPage.jsx)
- Retrieve `countryId` from the URL.
- Fetch all universities where `country_id` matches the current country.
- Display a list/grid of University cards. Clicking navigates to `/university/:id`.

## 4. Services Layer Updates
- **`locationService.js`**:
  - Implement `getContinents()` querying Supabase `continents` table.
  - Implement `getCountriesByContinent(continentId)` querying Supabase `countries` table.
- **`universityService.js`**:
  - Implement `getUniversitiesByCountry(countryId)` querying Supabase `universities` table.

## 5. Testing & Verification
- Run the SQL script in Supabase and ensure tables and foreign keys are created correctly.
- Verify that clicking through the hierarchy (Home -> Continent -> Country -> University) passes the correct IDs and fetches the right data.
- Ensure the UI matches the agreed-upon Grid Cards design.
