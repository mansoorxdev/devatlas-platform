# DevAtlas Server

The backend API server for the DevAtlas platform, built using Node.js, Express, and MongoDB.

## Features
- Structured layered architecture (Controllers -> Services -> Repositories -> Models)
- CORS setup for frontend connection
- API Security via Helmet
- Rate Limiting integration
- Subpath import aliases (`#config/*`, `#services/*`, `#models/*`, `#utils/*`)

## Setup
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Configure settings in `.env`.
3. Development mode (using native Node.js hot-reloader):
   ```bash
   npm run dev
   ```
4. Production start:
   ```bash
   npm start
   ```
