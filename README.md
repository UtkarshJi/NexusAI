# NexusAI - SaaS AI Customer Support Platform

A professional multi-tenant AI customer support platform with streaming chat, RAG pipeline, and embeddable widget.

## Tech Stack

- **Backend**: Python FastAPI (Async), SQLAlchemy (Async), Pydantic, PostgreSQL
- **Dashboard**: React (Vite), TypeScript, TailwindCSS, ShadCN UI, React Query
- **Widget**: Lightweight React bundle for client embedding
- **AI**: Groq API (Llama 3.3)
- **Vector DB**: PostgreSQL with pgvector

## Project Structure

```
├── backend/          # Python FastAPI backend
├── dashboard/        # React admin dashboard
├── widget/           # Embeddable chat widget
└── docker-compose.yml
```

## Quick Start

### 1. Start Database

```bash
docker-compose up -d
```

### 2. Setup Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env    # Edit with your settings
alembic upgrade head    # Run migrations
uvicorn app.main:app --reload
```

### 3. Setup Dashboard

```bash
cd dashboard
npm install
cp .env.example .env
npm run dev
```

### 4. Build Widget

```bash
cd widget
npm install
npm run build
# Output: dist/widget.js
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql+asyncpg://nexusai:nexusai_secret@localhost:5432/nexusai
GROQ_API_KEY=your-groq-api-key
SECRET_KEY=your-secret-key
CORS_ORIGINS=["http://localhost:5173"]
```

### Dashboard (.env)
```
VITE_API_URL=http://localhost:8000
```

## Widget Usage

```html
<script 
  src="https://your-cdn.com/widget.js" 
  data-project-key="your-project-api-key"
></script>
```

## License

MIT
