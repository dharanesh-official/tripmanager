# GlobeTrotter Implementation Plan

## Vision
A personalized, intelligent, and collaborative travel planning platform.
**Mission**: Simplify multi-city travel planning (manage stops, explore cities, budget, visualize, share).

## Technology Stack
- **Frontend**: Next.js (React) - App Router
- **Styling**: CSS Modules (Vanilla CSS with extensive Design Tokens for a Premium look)
- **Backend**: Next.js API Routes (Serverless)
- **Database**: MongoDB (via Mongoose)
- **Real-time**: Pusher (for live updates/collaboration) or Polling (fallback)
- **Auth**: NextAuth.js (Credentials + OAuth if needed)
- **Deployment**: Vercel

## Design System (Premium Aesthetics)
- **Typography**: Inter (Modern, Clean) or Outfit (Headings)
- **Colors**: Deep Teals, Vibrant Corals, Glassmorphism effects, Dark Mode support.
- **Animations**: Framer Motion for smooth transitions.

## Data Schema (MongoDB)
1.  **User**: name, email, password_hash, preferences, saved_trips
2.  **Trip**: title, description, start_date, end_date, cover_image, owner_id, collaborators, visibility (private/public)
3.  **ItineraryItem**: trip_id, type (transport, stay, activity), start_time, end_time, location_data, cost, status.
4.  **Activity/Destination**: Reference data for cities/activities.

## Screen Implementation Order
1.  **Foundation**: Setup, Global CSS, DB Connection, Auth Logic.
2.  **Auth Screens**: Login / Signup (Screen 1).
3.  **Home/Dashboard**: Landing Page, Recent Trips (Screen 2, 4).
4.  **Trip Creation**: Create Trip Flow (Screen 3).
5.  **Itinerary Builder**: The Core Drag-and-Drop/List Interface (Screen 5, 6, 10).
6.  **Discovery**: City/Activity Search (Screen 7, 8).
7.  **Budget & Visualization**: Charts and Calendar (Screen 9).
8.  **Shared View**: Public Read-only view (Screen 11).
9.  **Admin/Profile**: User settings and Admin Dashboard (Screen 12, 13).

## Phase 1: Initialization (Current)
- Setup Next.js
- Configure MongoDB
- Create Global Styles & Design Tokens
