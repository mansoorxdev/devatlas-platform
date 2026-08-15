# DevAtlas Platform — Production Deployment Guide

This guide details the complete production deployment procedure for the **DevAtlas Developer Knowledge & Utility Engine**.

---

## 📋 Architecture Overview

- **Frontend**: React 19 + Vite SPA (Deployable to Vercel, Netlify, Cloudflare Pages, or Render Static Site).
- **Backend**: Node.js + Express.js REST API (Deployable to Render Web Service, Railway, Fly.io, or AWS EC2).
- **Database**: MongoDB Atlas Cluster (M0 Free Tier or M10 Production Tier).

---

## 🗄️ 1. MongoDB Atlas Setup

1. Create a free or paid cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Database Access**, create a database user with `readWrite` permissions.
3. Under **Network Access**, add IP address whitelist `0.0.0.0/0` (or your backend provider's static IPs).
4. Retrieve your MongoDB connection URI string:
   ```text
   mongodb+srv://<db_user>:<db_password>@cluster0.mongodb.net/devatlas?retryWrites=true&w=majority
   ```
5. MongoDB schema text search indexes and compound indexes are automatically built by Mongoose on boot.

---

## ⚙️ 2. Server Deployment (Render / Railway / Node Web Service)

### Environment Variables Checklist (Server)
Set the following environment variables on your backend hosting provider:

| Variable Name | Required | Example Production Value |
| :--- | :-: | :--- |
| `PORT` | Yes | `5000` (or provider dynamic `$PORT`) |
| `NODE_ENV` | Yes | `production` |
| `CLIENT_URL` | Yes | `https://devatlas.com` (No trailing slash) |
| `MONGO_URI` | Yes | `mongodb+srv://user:pass@cluster.mongodb.net/devatlas` |
| `JWT_SECRET` | Yes | `<64-character-random-hex-string>` |
| `JWT_EXPIRES_IN` | Yes | `15m` |
| `JWT_REFRESH_SECRET` | Yes | `<64-character-random-hex-string>` |
| `JWT_REFRESH_EXPIRES_IN` | Yes | `7d` |

### Server Build & Start Commands
- **Root Directory**: `./server`
- **Build Command**: `npm install`
- **Start Command**: `npm start` (Executes `node src/server.js`)

---

## 💻 3. Frontend Deployment (Vercel / Netlify)

### Environment Variables Checklist (Client)
Set the following environment variables on your frontend hosting provider:

| Variable Name | Required | Example Production Value |
| :--- | :-: | :--- |
| `VITE_API_URL` | Yes | `https://api.devatlas.com/api/v1` |
| `VITE_CLIENT_URL` | Yes | `https://devatlas.com` |

### Frontend Build Settings
- **Framework Preset**: Vite
- **Root Directory**: `./client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### SPA Deep Link Rewrites
- **Netlify**: Handled automatically by `client/public/_redirects`.
- **Vercel**: Handled automatically by `client/vercel.json`.

---

## 🔑 4. Seed Administrative Account

After the database connection is established, run the admin seeding script from the `server` directory:

```bash
cd server
NODE_ENV=production node scripts/seed-admin.js
```

Default seeded credentials (Change password immediately in production!):
- **Email**: `admin@devatlas.com`
- **Password**: `AdminPassword123!`

---

## 🌐 5. CORS & Cookie Requirements

- Ensure `CLIENT_URL` on the server exactly matches your frontend domain (`https://devatlas.com`).
- Authentication cookies (`devatlas_at` and `devatlas_rt`) enforce:
  - `httpOnly: true` (Protects against XSS)
  - `secure: true` (Enforced automatically in `production` mode over HTTPS)
  - `sameSite: Lax` (Provides CSRF protection for top-level navigation)

---

## 🔍 6. SEO & Sitemap Verification

Verify public crawler files after production deployment:
1. `https://devatlas.com/robots.txt` — Confirms `/portal-master` and `/api/` are disallowed.
2. `https://api.devatlas.com/sitemap.xml` (or `https://devatlas.com/sitemap.xml`) — Confirms published articles, snippets, and error solutions are indexed with ISO modification dates.

---

## 🧪 7. Production Smoke Testing Checklist

- [ ] `GET /health` returns `{ "success": true, "status": "healthy" }`.
- [ ] Homepage loads articles, snippets, and error solutions.
- [ ] Global search returns published content for `javascript`.
- [ ] All 5 DevTools (`JSON Formatter`, `JWT Inspector`, `UUID Generator`, `Base64 Tool`, `URL Encoder`) work 100% client-side.
- [ ] Admin login at `/portal-master/login` succeeds and sets HttpOnly cookies.
- [ ] Unauthenticated requests to `/portal-master` redirect to `/portal-master/login`.
- [ ] Rapid failed login attempts (6+) trigger HTTP 429 `TOO_MANY_REQUESTS`.
- [ ] Sitemap excludes draft items and MongoDB IDs.
