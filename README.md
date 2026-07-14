# DocLocker

> **Production-Style AI-Powered Document Management Platform**

DocLocker is a production-oriented cloud document management platform
inspired by Google Drive. It combines secure document storage with
AI-powered document summarization and is being extended with
Retrieval-Augmented Generation (RAG) for document chat.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Running the BullMQ Worker](#running-the-bullmq-worker)
- [API Overview](#api-overview)
- [AI Summary Pipeline](#ai-summary-pipeline)
- [Redis Cache Strategy](#redis-cache-strategy)
- [Socket.IO Events](#socketio-events)
- [Branch Strategy](#branch-strategy)
- [CI/CD](#cicd)
- [Monitoring](#monitoring)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## Features

### Authentication
- JWT Authentication
- HTTP-only Cookies
- Protected Routes
- OTP Authentication
- Password Reset

### Document Management
- Upload Documents
- Folder Management
- Rename / Delete / Restore / Permanent Delete
- Pagination

### AI Features
- Gemini 2.5 Flash Summaries
- Background Processing via BullMQ
- Summary Caching
- Real-time Status Updates over Socket.IO

### Infrastructure
- Redis Cache (Upstash)
- BullMQ Queue
- Socket.IO
- GitHub Actions CI
- Render Deployment
- UptimeRobot Monitoring

---

## Tech Stack

| Layer        | Technology            |
|--------------|------------------------|
| Frontend     | Next.js 15, React 19   |
| Backend      | Next.js API Routes     |
| Language     | JavaScript             |
| Database     | MongoDB Atlas          |
| Storage      | Cloudinary             |
| AI           | Gemini 2.5 Flash       |
| Cache        | Upstash Redis          |
| Queue        | BullMQ                 |
| Realtime     | Socket.IO              |
| Deployment   | Render                 |
| CI/CD        | GitHub Actions         |

---

## Architecture

```text
Client → Next.js → API Routes → BullMQ Producer → Redis Queue → Worker
                                                                    │
                                             ┌──────────────────────┘
                                             ▼
                            Download PDF → Extract Text → Gemini API
                                                                    │
                                             ┌──────────────────────┘
                                             ▼
                              MongoDB ← Redis Cache ← Socket.IO → Frontend
```

The same pipeline above handles both document processing and AI summarization — there's no separate flow, just different entry points (upload vs. summarize).

---

## Project Structure

```text
app/
lib/
 ├── auth/
 ├── bullmq/
 ├── cache/
 ├── services/
 ├── socket/
models/
middleware/
public/
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm
- MongoDB Atlas account
- Upstash Redis instance
- Cloudinary account
- Google Gemini API key

### Installation

```bash
git clone https://github.com/officialkaushik/doclocker.git
cd doclocker
npm install
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
NODE_ENV=development

MONGODB_URI=

JWT_SECRET=
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

GEMINI_API_KEY=

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

REDIS_URL=

USE_BULLMQ=true

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Running the Project

```bash
npm run dev
```

---

## Running the BullMQ Worker

BullMQ requires a separate worker process to consume jobs from the queue:

```bash
npm run worker
```

> Note: the worker must be running for background summarization to complete. On `release` branch deployments (`USE_BULLMQ=false`), summarization runs synchronously instead, so no worker process is needed.

---

## API Overview

| Method | Endpoint                      | Description       |
|--------|--------------------------------|--------------------|
| POST   | `/api/v1/auth/login`          | Login              |
| POST   | `/api/v1/auth/register`       | Register           |
| POST   | `/api/v1/files/upload`        | Upload File        |
| POST   | `/api/v1/files/:id/summarize` | Generate Summary   |
| GET    | `/api/v1/health/redis`        | Redis Health Check |

The Redis health endpoint is polled by UptimeRobot every 5 minutes to keep the instance warm and detect downtime early.

---

## AI Summary Pipeline

```text
User → POST /summarize → BullMQ Producer → Worker
                                              │
                          Download PDF → Extract Text → Gemini
                                              │
                          MongoDB ← Redis Cache ← Socket.IO → Frontend
```

---

## Redis Cache Strategy

| Purpose   | Key Pattern                                    |
|-----------|-------------------------------------------------|
| Dashboard | `dashboard:{userId}:page:{page}:limit:{limit}`   |
| Summary   | `summary:{documentId}`                           |
| OTP       | `otp:{userId}`                                   |

> **Caveat:** Upstash Redis is REST-based and serverless — it doesn't maintain a persistent idle connection the way a traditional self-hosted Redis instance does. Each request is effectively a fresh HTTPS call, so "keep-alive" pings via the health-check endpoint help avoid cold-start latency but don't keep a socket open in the traditional sense.

---

## Socket.IO Events

- `summary:queued`
- `summary:processing`
- `summary:progress`
- `summary:completed`
- `summary:failed`

---

## Branch Strategy

```text
feature/*  →  main  →  release  →  Render
```

- **main** — BullMQ + Socket.IO (async summarization)
- **release** — Synchronous summarization (`USE_BULLMQ=false`), no worker required

---

## CI/CD

GitHub Actions pipeline runs on every push:
- Install dependencies
- Build
- Validate

---

## Monitoring

- UptimeRobot — polls `/api/v1/health/redis` every 5 minutes
- Render deployment logs

---

## Deployment

### Main Branch
- BullMQ + Worker process
- Socket.IO real-time updates

### Release Branch
- Synchronous summarization
- No worker process required

---

## Roadmap

- [x] Authentication
- [x] OTP
- [x] Dashboard
- [x] AI Summary
- [x] BullMQ
- [x] Socket.IO
- [ ] RAG Chunking
- [ ] Embeddings
- [ ] pgvector Integration
- [ ] Similarity Search
- [ ] AI Chat (RAG-based Q&A over documents)
- [ ] OCR
- [ ] Image Understanding

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

---

## License

MIT License

---

## Author

**Kaushik Rajbongshi**

- Portfolio: https://kaushikrajbongshi.in
- GitHub: https://github.com/officialkaushik
- LinkedIn: https://linkedin.com/in/kaushikrajbongshi