<p align="center">
  <img src="https://github.com/user-attachments/assets/abbe1173-7b62-4fab-b366-017ff2082e2d" 
       alt="Lakshmi Didi Logo" 
       width="150"/>
</p>

<h1 align="center">Lakshmi Didi — लक्ष्मी दीदी</h1>

> A multilingual Indian finance assistant chat app. Talk about savings, investments, insurance, and money management in English or Hindi featuring stunning UI and Voice mode.

**LIVE DEMO:** [https://financial-assistance-platform-ten.vercel.app/](https://financial-assistance-platform-ten.vercel.app/)

---

## ✨ Features

| Feature | Details |
|---|---|
| Language | English & Hindi |
| Personas | Maa (caring), Banker (formal), Dost (friendly) |
| Chat & Voice | Structured text responses + Full Sarvam-powered Voice Pipeline |
| History | Conversation sessions safely stored in MongoDB |
| Tools | Quick Fixed Deposit (FD) Yield Calculators |
| LLM | Gemini 1.5 Flash Ready + Mock Provider |
| UI | Mobile-first, warm Indian custom styling (Tailwind v4) |

---

## 🚀 Quick Start (Local Setup)

### Automated (macOS / Linux)
```bash
chmod +x start.sh && ./start.sh
```
Then open **http://localhost:5173**

---

### Manual setup

Ensure you have **Node.js v20+** installed.

#### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

#### Frontend (separate terminal)
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Add Gemini & MongoDB (Real AI + DB)

Edit your `backend/.env` to configure your keys:

```env
PORT=8000
DATABASE_URL=mongodb://localhost:27017/lakshmi_didi
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_key
SARVAM_API_KEY=your_sarvam_key
```

And your `frontend/.env`:
```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_API_URL=http://localhost:8000/api
```

---

## 📁 Project Structure

```
lakshmi-didi/
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── index.ts             # Express application entry
│       ├── config/              # Environment binding
│       ├── db/                  # MongoDB drivers
│       ├── middleware/          # JWT and Auth tracking
│       ├── routes/              # Express API Routes (auth, chat, voice, sessions)
│       ├── services/            # Core business logic
│       ├── types/               # App interfaces
│       └── providers/
│           ├── mock.ts          # Offline demo provider
│           ├── gemini.ts        # Production Gemini provider
│           └── sarvam.ts        # Transcriptions (STT/TTS)
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── pages/               # React Screen flows (Home, Voice, Login, FdCalc, etc)
│       ├── store/               # Zustand global state (useAppStore.ts)
│       ├── lib/                 # Axios API configurations
│       └── index.css            # Tailwind CSS v4 Main File
│
├── render.yaml                  # Render Production Blueprint
├── Dockerfile                   # Single Container Deployment config
└── start.sh                     # Bash Dev Launcher
```

---

## 🌐 API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/google` | Google sign-in/up |
| POST | `/api/sessions/` | Create new chat session |
| GET | `/api/sessions/` | List recent sessions attached to User |
| GET | `/api/sessions/{id}` | Get session + message history |
| POST | `/api/chat/{session_id}` | Send message, get AI reply |
| POST | `/api/voice/process` | Audio processing pipeline (STT -> LLM -> TTS) |

---

## 🚀 Deployment (Vercel + Render)

This application is structurally decoupled and ready to drop onto PaaS platforms.

1. **Deploy Frontend to Vercel**: 
   - Connect GitHub, set Root Directory to `frontend`. 
   - Framework Preset: `Vite`.
   - Ensure `VITE_API_URL` environment variable points to your live backend url.

2. **Deploy Backend to Render**:
   - Use the attached `render.yaml` Blueprint directly on your Dashboard!
   - Root Directory: `backend`
   - Start Command: `npm start`
   - Build Command: `npm install && npm run build`
   - Make sure you supply all `GEMINI`, `DATABASE_URL`, and `SARVAM_API_KEY` configurations!

---

## 📄 License

MIT — free to use, fork, and build on.
