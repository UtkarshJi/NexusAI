<p align="center">
  <img src="docs/logo.svg" alt="NexusAI Logo" width="80" height="80">
</p>

<h1 align="center">NexusAI</h1>

<p align="center">
  <strong>Build AI-powered customer support chatbots with RAG (Retrieval-Augmented Generation)</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#live-demo">Live Demo</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#widget-integration">Widget Integration</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#tech-stack">Tech Stack</a>
</p>

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Dashboard** | [dashboard-iota-seven-66.vercel.app](https://dashboard-iota-seven-66.vercel.app) |
| **API** | [nexusai-api.onrender.com](https://nexusai-api.onrender.com) |
| **API Docs** | [nexusai-api.onrender.com/docs](https://nexusai-api.onrender.com/docs) |

---

## ✨ Features

- 🤖 **AI-Powered Chatbots** - Create intelligent customer support bots using Groq's LLM API
- 📚 **Knowledge Base (RAG)** - Upload documents to give your chatbot context-aware responses
- 🔑 **API Key Management** - Generate unique API keys for each project
- 💬 **Embeddable Widget** - Drop-in chat widget for any website
- 🎨 **Modern Dashboard** - Beautiful admin interface to manage projects
- ⚡ **Real-time Streaming** - Stream responses for a natural chat experience

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose (recommended)
- OR: Python 3.11+, Node.js 18+, PostgreSQL 15+
- [Groq API Key](https://console.groq.com/keys) (free)

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/UtkarshJi/NexusAI.git
cd NexusAI

# Copy environment files
cp backend/.env.example backend/.env
# Edit backend/.env with your GROQ_API_KEY

# Start all services
docker-compose up -d

# Access the app
# Dashboard: http://localhost:5173
# API Docs: http://localhost:8000/docs
```

### Manual Setup

<details>
<summary>Click to expand manual setup instructions</summary>

1. **Set up the backend**
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   # source .venv/bin/activate  # Linux/Mac
   
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your database URL and Groq API key
   
   alembic upgrade head
   uvicorn app.main:app --reload --port 8000
   ```

2. **Set up the frontend**
   ```bash
   cd dashboard
   npm install
   npm run dev
   ```

3. **Access the app**
   - Dashboard: http://localhost:5173
   - API Docs: http://localhost:8000/docs

</details>

---

## 💬 Widget Integration

Add the NexusAI chat widget to any website with a single script tag:

```html
<script 
  src="https://nexusai-api.onrender.com/widget.js"
  data-project-key="YOUR_API_KEY"
  data-api-url="https://nexusai-api.onrender.com"
></script>
```

### Configuration Options

| Attribute | Description | Required |
|-----------|-------------|----------|
| `data-project-key` | Your API key from dashboard | ✅ Yes |
| `data-api-url` | Backend API URL | ✅ Yes |
| `data-position` | `bottom-right` or `bottom-left` | No |
| `data-primary-color` | Theme color (hex) | No |

---

## 🌐 Deployment

### Frontend → Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from dashboard folder
cd dashboard
vercel
```

Or import on [Vercel Dashboard](https://vercel.com):
- Root Directory: `dashboard`
- Environment Variable: `VITE_API_URL` = Your Render backend URL

### Backend → Render

1. Connect repository on [Render](https://render.com)
2. Use **"New Blueprint"** (auto-reads `render.yaml`)
3. Set environment variables:
   - `GROQ_API_KEY` = Your Groq API key
   - `CORS_ORIGINS` = `["https://your-app.vercel.app"]`

---

## 🛠 Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React, TypeScript, Vite, TailwindCSS |
| **Backend** | FastAPI, Python, SQLAlchemy |
| **Database** | PostgreSQL with pgvector |
| **AI/LLM** | Groq API (Llama 3) |
| **Auth** | JWT with bcrypt |
| **Hosting** | Vercel (frontend), Render (backend) |

---

## 📁 Project Structure

```
NexusAI/
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── models/   # SQLAlchemy models
│   │   ├── routers/  # API route handlers
│   │   ├── schemas/  # Pydantic schemas
│   │   └── services/ # Business logic
│   └── alembic/      # Database migrations
├── dashboard/        # React frontend
│   └── src/
│       ├── components/
│       ├── hooks/
│       └── pages/
├── widget/           # Embeddable chat widget
├── docker-compose.yml
├── render.yaml       # Render deployment config
└── vercel.json       # Vercel deployment config
```

---

## 🔑 Environment Variables

### Backend
```env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/nexusai
GROQ_API_KEY=your-groq-api-key
SECRET_KEY=your-secret-key
CORS_ORIGINS=["http://localhost:5173"]
```

### Frontend
```env
VITE_API_URL=http://localhost:8000
```

---

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/UtkarshJi">UtkarshJi</a>
</p>
