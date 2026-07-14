# Frontend Documentation

This document describes the frontend setup, configuration, and how it integrates with the backend microservices.

## 1. Tech Stack

- React 19
- TypeScript
- Vite 8
- React Router v7
- Axios
- Tailwind CSS
- React Compiler
- ESLint

## 2. Project Structure

- `src/api/` - Axios clients and typed API helpers
- `src/components/` - Reusable UI components
- `src/pages/` - Route-level pages
- `src/layouts/` - Shared layout wrappers
- `src/utils/` - Auth and helpers
- `vite.config.ts` - Vite and dev server config
- `tsconfig.json` - TypeScript configuration

## 3. Install and Run

```bash
cd frontend
npm install
npm run dev
```

The dev server listens on `http://localhost:5173` by default.

## 4. Environment Variables

The frontend uses `VITE_` prefixed environment variables. Create a `.env` file in the `frontend/` folder if needed.

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_AUTH_API_URL` | `http://localhost:5000/api/auth` | User service auth API |
| `VITE_STUDENT_API_URL` | `http://localhost:3001/api/student` | Student-facing exam/class API |
| `VITE_TEACHER_API_URL` | `http://localhost:3001/api/teacher` | Teacher-facing exam/class API |
| `VITE_NOTIFICATION_API_URL` | `http://localhost:3004/api/notifications` | Notification service API |
| `VITE_ADMIN_API_URL` | `http://localhost:5000/api/admin` | Admin service API |

For Docker, prefer pointing these to the API gateway or service hostnames instead of `localhost`.

## 5. Docker Compose

In the root `docker-compose.yml`, the frontend service runs with:

- Image: `node:20-alpine`
- Host port: `5173`
- Container port: `5173`
- Env: `VITE_API_BASE_URL=http://localhost:3100`

Start it with:

```bash
docker compose up -d frontend
```

Rebuild after dependency changes:

```bash
docker compose up -d --build frontend
```

## 6. Ports

| Service | Host Port | Container Port | Notes |
| --- | --- | --- | --- |
| Frontend | `5173` | `5173` | Web app |
| API Gateway | `3100` | `3000` | Main API gateway |
| User Service | `5000` | `5000` | Auth and user management |
| Exam Service | `3001` | `3001` | Exam, class, assignment APIs |
| Question Service | `3002` | `3002` | Question bank |
| AI Generation Service | `3003` | `3003` | AI generation orchestration |
| Notification Service | `3004` | `3004` | Notifications |
| Infrastructure Service | `5005` | `5005` | Infrastructure/monitoring APIs |
| AI Worker API | `8000` | `8000` | AI worker REST API |

## 7. API Clients

Main axios clients live under `src/api/`:

- `src/api/axios/User.ts` - Auth, login, profile, password reset, Google OAuth result
- `src/api/studentApi.ts` - Student dashboard, classes, assignments, exam taking, results
- `src/api/teacherApi.ts` - Teacher dashboard, courses, classes, exams, assignments, posts
- `src/api/notificationApi.ts` - Notification list, mark read, read all
- `src/api/Admin.ts` - Admin dashboard, users, courses, AI jobs, queue jobs, logs, questions

Each client attaches the bearer token from local storage automatically and redirects to `/login` on `401`.

## 8. Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript check then build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |

## 9. Troubleshooting

- If API calls fail in Docker, ensure the frontend env variables point to reachable backend addresses.
- If `npm run dev` restarts endlessly, check file watcher limits or run Vite with polling.
- For auth issues, verify `VITE_AUTH_API_URL` matches the running auth service and Google callback URLs.
