# NexusAI Deployment Guide

This guide details how to deploy the NexusAI platform to production using **Render** (for the backend/database) and **Vercel** (for the frontend).

## 📋 Prerequisites

- A [GitHub](https://github.com) account (where this repo is hosted).
- A [Render](https://render.com) account (for backend & database).
- A [Vercel](https://vercel.com) account (for frontend dashboard).
- A [Groq API Key](https://console.groq.com) (for AI functionality).

---

## 🚀 Deployment Strategy

Since the frontend needs the backend URL, and the backend needs the frontend URL (for CORS security), we perform the deployment in 3 phases:

1. **Deploy Backend** (Render) -> Get the Backend URL.
2. **Deploy Frontend** (Vercel) -> Use Backend URL -> Get Frontend URL.
3. **Connect Everything** -> Update Backend with Frontend URL.

---

## Phase 1: Deploy Backend to Render

### Step A: Create a Free Database
Since Render's "Blueprint" auto-creation often requires a credit card, we'll create the database manually (or use an external free provider):

**Option 1: Render Free Postgres (Requires Card sometimes)**
1. Dashboard -> New -> PostgreSQL.
2. Name: `nexusai-db`, Plan: Free.
3. Copy the **Internal Connection String** (if deploying backend to Render) or External (if running locally).

**Option 2: Neon / Supabase (No Card)**
1. Create a free account on [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com).
2. Create a project and copy the **Postgres Connection String**.
   - Format: `postgresql://user:pass@host:port/dbname`
   - *Tip*: If using Supabase, use port 5432 and "Transaction" mode if possible.

### Step B: Deploy User Service
1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository: `UtkarshJi/NexusAI`.
4. Render will detect `render.yaml`.
5. Click **Apply Blueprint**.
6. **IMPORTANT**: You will be asked for Environment Variables.
   - `DATABASE_URL`: Paste the connection string from Step A.
   - `GROQ_API_KEY`: Paste your key from Groq Console.
7. Click **Update/Deploy**.
8. **Wait for deployment** to finish.
9. Copy the **Service URL** (e.g., `https://nexusai-api-xyz.onrender.com`).

---

## Phase 2: Deploy Frontend to Vercel

1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository: `UtkarshJi/NexusAI`.
4. **Configure Project**:
   - **Framework Preset**: Vite (should be auto-detected).
   - **Root Directory**: `dashboard`. **IMPORTANT**: You must edit the Root Directory to be `dashboard` if it's not already.
     - *Correction*: Since we added `vercel.json`, Vercel might handle the root automatically, but if you see an option to "Edit" the Root Directory, set it to `dashboard`.
5. **Environment Variables**:
   - Expand the Environment Variables section.
   - Key: `VITE_API_URL`
   - Value: The **Render URL** you copied in Step 1 (e.g., `https://nexusai-api-xyz.onrender.com`).
6. Click **Deploy**.
7. Once deployed, copy the **Domain** (e.g., `nexusai-dashboard.vercel.app`).

---

## Phase 3: Final Connection (CORS & Migrations)

### Update Backend CORS
1. Go back to [Render Dashboard](https://dashboard.render.com).
2. Select the `nexusai-api` service.
3. Go to **Environment**.
4. Add/Update the `CORS_ORIGINS` variable:
   - Key: `CORS_ORIGINS`
   - Value: `["https://nexusai-dashboard.vercel.app"]` (Replace with your actual Vercel domain).
5. Click **Save Changes**. Render will redeploy automatically.

### Run Database Migrations
1. In Render, go to the `nexusai-api` service.
2. Click on the **Shell** tab (Connect via SSH).
3. Run the following commands to create the database tables:
   ```bash
   cd backend
   alembic upgrade head
   ```
   *If successful, you should see output about running migrations.*

---

## ✅ Verification

1. Open your Vercel URL.
2. Try to **Register** a new user.
3. Log in and Create a Project.
4. If everything works, your production deployment is complete! 🎉
