# DevAtlas Client

The frontend application for DevAtlas platform, built using React 19, Vite, and Tailwind CSS v4.

## Features
- Modular Feature-First Architecture
- Styled with Tailwind CSS v4 (no configuration file, configured inside `index.css`)
- State management via Zustand
- Data fetching and caching via TanStack Query (React Query)
- Route management via React Router
- SEO optimizations via React Helmet Async

## Setup & Running
1. Configuration is managed in `.env`.
2. Run development server (from workspace root):
   ```bash
   npm run dev:client
   ```
3. Build for production:
   ```bash
   npm run build
   ```
