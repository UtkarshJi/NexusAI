# NexusAI Deployment Guide (Render Only)

This guide details how to deploy the entire NexusAI platform (Frontend + Backend) to **Render**.

## 📋 Prerequisites

- A [GitHub](https://github.com) account.
- A [Render](https://render.com) account.
- A [Groq API Key](https://console.groq.com).
- A **PostgreSQL Connection String** (from Neon, Supabase, or Render).

---

## 🚀 All-in-One Deployment

### Step 1: Deploy with Blueprints

1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Blueprint**.
3. Connect your repo: `UtkarshJi/NexusAI`.
4. Render will detect two services:
   - `nexusai-api` (Web Service)
   - `nexusai-dashboard` (Static Site)
5. Click **Apply Blueprint**.
6. **Provide Environment Variables**:
   - `DATABASE_URL`: Your Postgres connection string.
   - `GROQ_API_KEY`: Your Groq API key.
   - `CORS_ORIGINS`: Leave empty for now (we'll update later).
   - `VITE_API_URL`: Leave empty for now (we'll update later).
7. Click **Update/Deploy**.

*Note: The initial deployment might fail or be incomplete because the services don't know each other's URLs yet. This is normal.*

### Step 2: Cross-Connect Services

Once the services are created (even if deployment failed), Render assigns them URLs.

**1. Get URLs:**
- Go to Dashboard.
- Copy `nexusai-api` URL (e.g., `https://nexusai-api-xyz.onrender.com`).
- Copy `nexusai-dashboard` URL (e.g., `https://nexusai-dashboard-abc.onrender.com`).

**2. Update Frontend Config:**
- Go to **nexusai-dashboard** -> **Environment**.
- Add/Update `VITE_API_URL` -> Paste the **Backend URL**.
- Click **Save Changes** (triggers redeploy).

**3. Update Backend Config:**
- Go to **nexusai-api** -> **Environment**.
- Add/Update `CORS_ORIGINS` -> Paste `["https://nexusai-dashboard-abc.onrender.com"]` (use your actual frontend URL).
- Click **Save Changes** (triggers redeploy).

### Step 3: Run Database Migrations

1. Go to **nexusai-api** service.
2. Click **Shell**.
3. Run:
   ```bash
   cd backend
   alembic upgrade head
   ```

---

## ✅ Verification

1. Open your **nexusai-dashboard** URL.
2. Register and create a project.
3. If successful, you are fully deployed on Render!
