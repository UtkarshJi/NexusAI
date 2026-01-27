# NexusAI Deployment Guide (Split: Vercel + Render)

This guide details how to deploy the **Frontend to Vercel** and **Backend + Database to Render**.

## 📋 Prerequisites

- [GitHub Account](https://github.com)
- [Render Account](https://render.com)
- [Vercel Account](https://vercel.com)
- [Groq API Key](https://console.groq.com)

---

## Phase 1: Render Database & Backend

### 1. Create Database (Render)
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **PostgreSQL**.
3. Name: `nexusai-db`.
4. Copy the **Internal Deployment URL** (looks like `postgres://...`).
   *(Note: You'll use this for the Backend service running on Render)*.

### 2. Deploy Backend API
1. On Render Dashboard, Click **New +** -> **Blueprint**.
2. Connect your repo: `UtkarshJi/NexusAI`.
3. It will detect `nexusai-api` (from `render.yaml`).
4. Click **Apply Blueprint**.
5. **Environment Variables**:
   - `DATABASE_URL`: Paste the Internal DB URL you copied.
   - `GROQ_API_KEY`: Paste your Groq Key.
   - `CORS_ORIGINS`: Leave empty for now.
6. Click **Update/Deploy**.
7. Once finished, copy the **Service URL** (e.g., `https://nexusai-api.onrender.com`).

---

## Phase 2: Vercel Frontend

1. Log in to [Vercel Dashboard](https://vercel.com).
2. **Add New...** -> **Project**.
3. Import `UtkarshJi/NexusAI`.
4. **BEFORE CLICKING DEPLOY**, configure the following:
   - **Framework Preset**: Vite
   - **Root Directory**: Click "Edit" and type `dashboard`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Environment Variables** (expand the section):
   - Key: `VITE_API_URL`
   - Value: Your **Render Backend URL** from Phase 1 (e.g., `https://nexusai-api.onrender.com`)
6. Click **Deploy**.
7. Once finished, copy the **Frontend Domain** (e.g., `nexusai.vercel.app`).

---

## Phase 3: Connect & Initialize

### 1. Update Backend CORS
1. Go to Render Dashboard -> `nexusai-api`.
2. **Environment** -> **Edit**.
3. Add `CORS_ORIGINS` value: `["https://nexusai.vercel.app"]` (Use your actual Vercel URL).
4. Save Changes (Automatic Redeploy).

### 2. Run Database Migrations
1. Go to Render Dashboard -> `nexusai-api`.
2. Click **Shell**.
3. Run:
   ```bash
   cd backend
   alembic upgrade head
   ```

### 3. Verify
Open your Vercel URL and check if you can Register/Login.
