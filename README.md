<p align="center">
  <img src="docs/logo.svg" alt="NexusAI Logo" width="80" height="80">
</p>

<h1 align="center">NexusAI</h1>

<p align="center">
  <strong>Build AI-powered customer support chatbots with RAG (Retrieval-Augmented Generation)</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#tech-stack">Tech Stack</a>
</p>

---

## ✨ Features

- 🤖 **AI-Powered Chatbots** - Create intelligent customer support bots using Groq's LLM API
- 📚 **Knowledge Base (RAG)** - Upload documents to give your chatbot context-aware responses
- 🔑 **API Key Management** - Generate unique API keys for each project
- 💬 **Embeddable Widget** - Drop-in chat widget for any website
- 🎨 **Modern Dashboard** - Beautiful admin interface to manage projects
- ⚡ **Real-time Streaming** - Stream responses for a natural chat experience

---

## 📸 Screenshots

### Login Page
Clean, modern authentication interface.

![Login Page](docs/login.png)

### Dashboard
Manage all your AI chatbot projects in one place.

![Dashboard](docs/dashboard.png)

### Project Management
Configure your chatbot, upload knowledge base documents, and test the AI.

![Project Detail](docs/project-detail.png)

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ (with pgvector extension)
- [Groq API Key](https://console.groq.com/keys) (free)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/UtkarshJi/NexusAI.git
   cd NexusAI
   ```

2. **Set up the backend**
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

3. **Set up the frontend**
   ```bash
   cd dashboard
   npm install
   npm run dev
   ```

4. **Access the app**
   - Dashboard: http://localhost:5173
   - API Docs: http://localhost:8000/docs

---

## 🌐 Deployment

### Frontend → Vercel

1. Import repository on [Vercel](https://vercel.com)
2. Set environment variable:
   - `VITE_API_URL` = Your Render backend URL

### Backend → Render

1. Connect repository on [Render](https://render.com)
2. Use "New Blueprint" (auto-reads `render.yaml`)
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
│   │   ├── api/      # API routes
│   │   ├── core/     # Config, security
│   │   ├── models/   # SQLAlchemy models
│   │   ├── routers/  # Route handlers
│   │   └── services/ # Business logic
│   └── alembic/      # Database migrations
├── dashboard/        # React frontend
│   └── src/
│       ├── components/
│       ├── hooks/
│       └── pages/
├── widget/           # Embeddable chat widget
├── render.yaml       # Render deployment config
└── vercel.json       # Vercel deployment config
```

---

## 🔑 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/nexusai
GROQ_API_KEY=your-groq-api-key
SECRET_KEY=your-secret-key
CORS_ORIGINS=["http://localhost:5173"]
```

### Frontend (.env)
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
