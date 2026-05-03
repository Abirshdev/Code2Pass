# BDU ExitPrep

Independent online learning and exit-exam preparation for Ethiopian university computing students. **Not affiliated with Bahir Dar University** or any institution—this is a curriculum-inspired practice platform.

## Stack

- **MongoDB** + **Mongoose**
- **Express** REST API
- **React** (Vite) + **Tailwind CSS**
- **JWT** auth, **bcrypt** passwords
- **PDF** certificates (**pdfkit** + **qrcode**)

## Folder structure

```
Abirshdev3/
├── README.md
├── server/                 # Node API
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js
│       ├── models/
│       ├── routes/
│       ├── middleware/
│       ├── utils/
│       └── scripts/seed.js
└── client/                 # React SPA
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
```

## Prerequisites

- Node.js 18+
- MongoDB running locally, or a MongoDB Atlas URI

## Setup

### 1. Server

```powershell
cd server
copy .env.example .env
# Edit .env: MONGODB_URI, JWT_SECRET, CLIENT_URL
npm install
npm run seed
npm run dev
```

API listens on `http://localhost:5000` by default.

### 2. Client

```powershell
cd client
npm install
npm run dev
```

App runs at `http://localhost:5173`. Vite proxies `/api` to the backend in development.

For a **production** build, set `VITE_API_URL` in `client/.env` to your public API origin (for example `https://api.example.com`).

## Sample logins (after seed)

| Role    | Email                 | Password   |
|---------|----------------------|------------|
| Admin   | admin@exitprep.local | admin123   |
| Student | student@exitprep.local | student123 |

## Features

- Six departments with year-based courses (seeded with full course grid per department).
- Lessons (notes, optional YouTube embed, code examples), per-course quizzes, department **mock exit exams**.
- Progress: marking all lessons complete issues a **course completion** certificate (score shown as 100%).
- Quiz or exit exam score **≥ 70%** issues a certificate; PDF download from **Certificates**; public verification at **`/verify/:certificateId`** (API: `GET /api/certificates/verify/:certificateId`).
- **English** and **Amharic** UI strings (language switcher in the header).
- Optional **dark mode** (toggle in header).
- **Admin** panel: departments, courses, lessons, questions, user roles.

## API routes (summary)

- `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me`
- `GET|POST|PUT|DELETE /api/departments` (mutations admin)
- `GET|... /api/courses`, `/api/lessons`, `/api/questions` (questions list admin-only)
- `POST /api/quiz/course/start|submit`, `POST /api/quiz/exit/start|submit`, `GET /api/quiz/results/:id`
- `GET|POST /api/progress`, `POST /api/progress/lesson-complete`
- `GET /api/certificates/mine`, `GET /api/certificates/verify/:certificateId`, `GET /api/certificates/:certificateId/pdf` (owner only)
- `GET /api/users`, `PATCH /api/users/:id/role`, `DELETE /api/users/:id` (admin)

## License

Use and modify for your own learning projects.
