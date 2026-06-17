# 🌌 Mind Sky

A premium mental health companion app built with the MERN stack — featuring AI-powered chat, emotional tracking, journaling, and gamification.

---

## 🧰 Prerequisites

Make sure you have these installed before starting:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Git](https://git-scm.com/)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Prashant1659/Mind-Sky.git
cd Mind-Sky
```

---

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
# Leave blank to use auto in-memory MongoDB (great for local dev)
MONGO_URI=

# Any secret string for JWT signing
JWT_SECRET=your_secret_here

# AI Gateway — fill these to enable real AI chat & scoring
# Leave blank to use the built-in fallback responses
AI_GATEWAY_URL=https://your-ai-endpoint.com/api
AI_GATEWAY_KEY=your_api_key_here

PORT=5001
```

> **Note:** If you leave `MONGO_URI` blank, the app automatically spins up an in-memory MongoDB — no installation needed.

Start the backend:

```bash
node server.js
```

You should see:
```
Connected to MongoDB successfully
Server running on port 5001
```

---

### 3. Set up the Frontend

Open a **new terminal tab/window**:

```bash
cd frontend
npm install
npm run dev
```

You should see:
```
VITE ready in Xms
➜  Local: http://localhost:5173/
```

---

### 4. Open the App

Visit **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 📁 Project Structure

```
Mind-Sky/
├── backend/
│   ├── middleware/       # JWT auth middleware
│   ├── models/           # Mongoose schemas (User)
│   ├── routes/           # API routes (auth, ai, assessment, dashboard)
│   ├── services/         # AI Gateway service layer
│   ├── .env.example      # Environment variable template
│   └── server.js         # Express entry point
│
└── frontend/
    ├── public/
│   │   └── guides/       # Guide character images (owl, bear, etc.)
    └── src/
        ├── components/   # React components (Dashboard, ChatBot, etc.)
        ├── utils/        # Shared constants (guides, sidebar items)
        └── main.jsx      # App entry point
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| PUT | `/api/auth/update-profile` | Update mood/streak/xp |
| POST | `/api/auth/add-journal` | Add a journal entry |
| POST | `/api/ai/chat` | Send a message to AI guide |
| GET | `/api/ai/history` | Get chat history |
| POST | `/api/assessment/submit` | Submit a questionnaire |
| GET | `/api/dashboard` | Get AI-powered dashboard insights |

---

## 🤖 Enabling Real AI

By default the app uses built-in fallback responses. To connect a real AI:

1. Open `backend/.env`
2. Set `AI_GATEWAY_URL` to your AI endpoint
3. Set `AI_GATEWAY_KEY` to your API key
4. Restart the backend

Compatible with any REST AI API (Gemini, OpenAI, custom, etc.)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB (or in-memory for local dev) |
| Auth | JWT |
| AI | Pluggable AI Gateway (bring your own endpoint) |

---

## 👤 Author

Made by [Prashant Swami](https://github.com/Prashant1659)
