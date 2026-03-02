# RAG.ai — Chat With Your Documents

A full-stack Retrieval-Augmented Generation (RAG) application that lets users upload documents and have AI-powered conversations about their content using semantic search and GPT-4o-mini.

**Live Demo:**
- Frontend: https://rag-project-nine.vercel.app
- Backend API: https://rag-project-8c2u.onrender.com

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Deployment](#deployment)

---

## Features

- **User Authentication** — Register, login, JWT-based sessions
- **Document Upload** — PDF, TXT, MD, JSON files up to 10MB
- **Automatic Processing** — Text extraction, chunking, and vector embedding generation
- **Semantic Search** — MongoDB Atlas Vector Search for finding relevant document chunks
- **RAG Chat** — Context-aware AI responses with source attribution
- **Conversation History** — Multi-turn conversations saved per user
- **Redis Caching** — Response cache (1h) and embedding cache (24h) via Upstash
- **User Profile** — Update name, change password, delete account with full data cleanup

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database and data models |
| MongoDB Atlas Vector Search | Semantic similarity search |
| LangChain | Text chunking and LLM orchestration |
| OpenAI API | Embeddings (Ada-002) + Chat (GPT-4o-mini) |
| Upstash Redis | Response and embedding caching |
| JWT + bcrypt | Authentication and password hashing |
| Multer | File upload handling |
| pdf-parse | PDF text extraction |

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Tailwind CSS | Styling |
| Axios | HTTP client |
| React Router v7 | Client-side routing |
| React Markdown | Render AI responses as markdown |
| React Dropzone | Drag-and-drop file upload |
| React Hot Toast | Notifications |
| Lucide React | Icons |
| Framer Motion | Animations |

### Infrastructure
| Service | Purpose |
|---|---|
| GitHub | Source control (monorepo) |
| Render | Backend hosting (auto-deploy) |
| Vercel | Frontend hosting (auto-deploy) |
| GitHub Actions | CI — build checks on push |

---

## Project Structure

```
rag-project/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI workflow
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── chatController.js
│   │   │   ├── documentController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT protect middleware
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Document.js     # Document + Chunk models
│   │   │   └── Conversation.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── chat.js
│   │   │   ├── documents.js
│   │   │   └── user.js
│   │   ├── utils/
│   │   │   ├── cache.js        # Upstash Redis helpers
│   │   │   ├── chunker.js      # Text extraction + splitting
│   │   │   └── openai.js       # LangChain + OpenAI helpers
│   │   └── index.js            # Express app entry point
│   ├── .env                    # Local env vars (not committed)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── DocumentPanel.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.js  # Auth state + localStorage
│   │   ├── hooks/
│   │   │   └── useChat.js      # Chat state management
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Register.jsx
│   │   ├── utils/
│   │   │   └── api.js          # Axios instance + all API calls
│   │   ├── App.js
│   │   └── index.js
│   ├── .env                    # Local env vars (not committed)
│   ├── .env.example
│   └── package.json
├── .gitignore
├── render.yaml                 # Render deployment config
└── README.md
```

---

## How It Works

### Document Upload Flow

```
User uploads file
  → Multer validates format (PDF/TXT/MD/JSON) and size (≤10MB)
  → Document record created with status: "processing"
  → Background process starts (non-blocking):
      → Extract text (pdf-parse for PDF, UTF-8 for others)
      → Split into chunks (LangChain, 1000 chars, 200 overlap)
      → Generate embeddings (OpenAI Ada-002, rate-limited)
      → Insert Chunk documents with embedding vectors
      → Update Document status: "ready"
```

### Chat (RAG) Flow

```
User sends message
  → Check response cache (Upstash Redis, 1h TTL)
  → If cached → return + save to conversation history
  → Generate query embedding (cache 24h)
  → MongoDB Atlas Vector Search (top-5 relevant chunks)
  → Build context string from chunks
  → Load last 10 conversation messages (history)
  → GPT-4o-mini generates response with context
  → Cache response (1h)
  → Save user message + AI response + sources to conversation
  → Return: { response, sources, conversationId }
```

---

## API Reference

All protected routes require `Authorization: Bearer <token>` header.

### Auth — `/api/auth`

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/register` | No | `{ name, email, password }` | `{ token, user }` |
| POST | `/login` | No | `{ email, password }` | `{ token, user }` |

### Documents — `/api/documents`

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/` | Yes | — | Array of documents |
| POST | `/upload` | Yes | `multipart/form-data` (file) | `{ documentId, status }` |
| DELETE | `/:id` | Yes | — | `{ message }` |

### Chat — `/api/chat`

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/` | Yes | `{ message, conversationId? }` | `{ response, sources, conversationId }` |
| GET | `/conversations` | Yes | — | Array of conversations |
| GET | `/conversations/:id` | Yes | — | Conversation with messages |
| DELETE | `/conversations/:id` | Yes | — | `{ message }` |

### User — `/api/user`

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/` | Yes | — | `{ user, stats }` |
| PUT | `/update` | Yes | `{ name }` | `{ user, message }` |
| PUT | `/change-password` | Yes | `{ currentPassword, newPassword }` | `{ message }` |
| DELETE | `/delete` | Yes | — | `{ message }` |

### Health

| Method | Endpoint | Response |
|---|---|---|
| GET | `/api/health` | `{ status: "OK", message }` |

---

## Data Models

### User
```js
{
  name: String,
  email: String (unique),
  password: String (bcrypt hashed),
  createdAt: Date
}
```

### Document
```js
{
  userId: ObjectId,
  documentId: String (UUID),
  name: String,
  size: Number,
  type: String,
  totalChunks: Number,
  status: "processing" | "ready" | "error",
  createdAt: Date
}
```

### Chunk (vector store)
```js
{
  userId: ObjectId,
  documentId: String,
  documentName: String,
  content: String,
  embedding: [Number],   // 1536-dim Ada-002 vector
  chunkIndex: Number,
  createdAt: Date
}
```

### Conversation
```js
{
  userId: ObjectId,
  conversationId: String (UUID),
  title: String,
  messages: [
    {
      role: "user" | "assistant",
      content: String,
      sources: [{ documentName, content, chunkIndex }],
      createdAt: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

---

## Environment Variables

### Backend `.env`

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>
OPENAI_API_KEY=sk-proj-...
JWT_SECRET=your-long-random-secret
UPSTASH_REDIS_REST_URL=https://<url>.upstash.io
UPSTASH_REDIS_REST_TOKEN=<token>
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env`

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (with Vector Search index named `vector_index` on `embedding` field)
- OpenAI API key
- Upstash Redis instance

### 1. Clone the repo

```bash
git clone https://github.com/github4rslan/rag-project.git
cd rag-project
```

### 2. Set up backend

```bash
cd backend
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

### 3. Set up frontend

```bash
cd frontend
cp .env.example .env
# .env already has REACT_APP_API_URL=http://localhost:5000/api
npm install
npm start
```

Backend runs on `http://localhost:5000`, frontend on `http://localhost:3000`.

### MongoDB Atlas Vector Search Index

Create a Vector Search index on the `chunks` collection with this config:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "userId"
    }
  ]
}
```
Index name must be: `vector_index`

---

## Deployment

### Backend → Render

The `render.yaml` at the root configures the service automatically.

1. Go to Render → New → Blueprint → connect this repo
2. Add environment variables in Render dashboard
3. Set `FRONTEND_URL` to your Vercel URL
4. Render auto-deploys on every push to `main`

### Frontend → Vercel

1. Go to Vercel → New Project → import this repo
2. Set **Root Directory** to `frontend`
3. Add environment variable: `REACT_APP_API_URL=https://rag-project-8c2u.onrender.com/api`
4. Vercel auto-deploys on every push to `main`

### Pushing Changes

```bash
# Backend changes only
git add backend/
git commit -m "your message"
git push origin main   # triggers Render redeploy

# Frontend changes only
git add frontend/
git commit -m "your message"
git push origin main   # triggers Vercel redeploy
```
