# Spur AI Chat Agent

A mini AI support agent for a live chat widget, built as a take-home assignment for Spur.

![TechGadgets Pro](https://img.shields.io/badge/TechGadgets-Pro-6366f1?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Svelte](https://img.shields.io/badge/Svelte-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

## 🌐 Live Demo

**[▶️ Try the Live Demo](https://spursoftwareapp.vercel.app)**

| Service | URL |
|---------|-----|
| Frontend | https://spursoftwareapp.vercel.app |
| Backend API | https://spur-software-api.onrender.com |

> **Note**: The backend runs on Render's free tier and sleeps after 15 mins of inactivity. First request may take ~30 seconds to wake up.

## ✨ Features

- **AI-Powered Support Chat**: Integrated with Groq (Llama 3.3 70B) for intelligent, fast responses
- **Conversation Persistence**: Messages stored in SQLite and restored on page reload
- **Modern UI**: Beautiful dark theme with smooth animations and typing indicators
- **Session Management**: Automatic session tracking via localStorage
- **FAQ Knowledge**: Pre-loaded with TechGadgets Pro store information
- **Robust Error Handling**: Graceful error messages for all failure scenarios

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 9+
- Groq API key (FREE!)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd aiBot
npm install
```

### 2. Get Your FREE Groq API Key

1. Go to: https://console.groq.com/keys
2. Sign up / sign in (free, takes 30 seconds)
3. Click **"Create API Key"**
4. Copy the key (starts with `gsk_...`)

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Groq API key:

```env
GROQ_API_KEY=gsk_your-key-here
```

### 4. Run Development Servers

```bash
npm run dev
```

This starts:
- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:5173

Open http://localhost:5173 in your browser to start chatting!

## 📁 Project Structure

```
├── packages/
│   ├── backend/                 # Express + TypeScript API
│   │   ├── src/
│   │   │   ├── index.ts         # Server entry point
│   │   │   ├── routes/          # API route handlers
│   │   │   │   └── chat.ts      # POST /chat/message, GET /chat/history
│   │   │   ├── services/        # Business logic
│   │   │   │   ├── chat.service.ts    # Message processing
│   │   │   │   └── llm.service.ts     # Groq/LLM integration
│   │   │   ├── repositories/    # Data access layer
│   │   │   │   ├── conversation.repo.ts
│   │   │   │   └── message.repo.ts
│   │   │   ├── db/              # Database setup & schema
│   │   │   ├── prompts/         # LLM system prompts & FAQ
│   │   │   └── middleware/      # Express middleware
│   │   └── package.json
│   └── frontend/                # Svelte + Vite UI
│       ├── src/
│       │   ├── App.svelte       # Main app component
│       │   ├── lib/
│       │   │   ├── components/  # ChatWidget, MessageList, etc.
│       │   │   ├── stores/      # Svelte stores (chat state)
│       │   │   └── api/         # API client
│       │   └── app.css          # Global styles
│       └── package.json
├── .env.example                 # Environment template
└── package.json                 # Monorepo root
```

## 🏗️ Architecture

### Backend Layers

```
Routes → Services → Repositories → Database
           ↓
      LLM Service → Groq API
```

| Layer | Responsibility |
|-------|---------------|
| **Routes** | HTTP handling, request validation (Zod) |
| **Services** | Business logic, orchestration |
| **Repositories** | Data access, SQL queries |
| **LLM Service** | Groq API wrapper, prompt management |

### Key Design Decisions

1. **Monorepo with npm workspaces**: Simple setup, easy to run together
2. **SQLite with sql.js**: Zero infrastructure, pure JS (no native compilation)
3. **Zod validation**: Runtime type safety for API requests
4. **Svelte stores**: Reactive state management with localStorage persistence
5. **Hardcoded FAQ in system prompt**: Fast to implement, easy to update

## 🤖 LLM Integration

### Provider
**Groq with Llama 3.3 70B Versatile** - Chosen for:
- **100% FREE** - No credit card required
- **Fast inference** - Groq's custom hardware
- **High quality** - State-of-the-art open model

### Prompting Strategy

The system prompt includes:
1. **Agent persona**: Friendly, professional support agent for TechGadgets Pro
2. **Store knowledge**:
   - Shipping policy (free over $50, ships to USA/Canada/UK/EU)
   - Return policy (30-day hassle-free, 90-day for defective)
   - Support hours (Mon-Fri 9AM-6PM EST)
   - Contact info (email, phone)
3. **Response guidelines**: Concise, helpful, honest

### Configuration

| Setting | Value |
|---------|-------|
| Model | `llama-3.3-70b-versatile` |
| Max tokens | 500 |
| Temperature | 0.7 |
| Context | Last 20 messages |

## 📡 API Reference

### POST /api/chat/message

Send a chat message and receive AI reply.

**Request:**
```json
{
  "message": "What's your return policy?",
  "sessionId": "optional-uuid-here"
}
```

**Response:**
```json
{
  "success": true,
  "reply": "We offer a 30-day hassle-free return policy...",
  "sessionId": "generated-or-same-uuid"
}
```

### GET /api/chat/history/:sessionId

Fetch conversation history for a session.

## 🛡️ Error Handling

| Scenario | Behavior |
|----------|----------|
| Empty message | 400 error, "Message cannot be empty" |
| Long message (>2000 chars) | Truncated, still processed |
| Invalid API key | 500 with friendly message |
| Rate limit | 503 with "try again" message |
| Invalid sessionId | Creates new conversation |

## 📊 Data Model

### conversations
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (UUID) | Primary key |
| created_at | TEXT | ISO timestamp |
| metadata | TEXT | JSON (optional) |

### messages
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (UUID) | Primary key |
| conversation_id | TEXT | FK to conversations |
| sender | TEXT | "user" or "ai" |
| text | TEXT | Message content |
| created_at | TEXT | ISO timestamp |

## ⚖️ Trade-offs & "If I Had More Time..."

| Current | With More Time |
|---------|---------------|
| SQLite (sql.js) | PostgreSQL for production |
| No auth | JWT + user accounts |
| localStorage session | HttpOnly cookies |
| Hardcoded FAQ | RAG with vector database |
| No streaming | SSE for token streaming |
| No rate limiting | Redis-based rate limiting |
| No WebSocket | Real-time updates |

## 🧪 Testing Checklist

- [x] Send "What's your return policy?" → Gets accurate FAQ answer
- [x] Send "Do you ship to USA?" → Gets correct shipping info
- [x] Refresh page → Conversation history restored
- [x] Send empty message → Prevented by frontend
- [x] Send while loading → Button disabled
- [x] Invalid API key → Friendly error shown

## 📝 License

MIT

---

Built with ❤️ for the Spur take-home assignment
