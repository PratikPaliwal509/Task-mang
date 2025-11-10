# Task Management System — MERN

Comprehensive task management app built with MongoDB, Express, React and Node (MERN). It includes role-based access (admin & user), task CRUD, filtering and collaboration features such as task comments.

This README covers: quick setup, environment variables, API endpoints (including comments), running locally with Docker, and useful development tips.

## Project overview

Key features
- JWT authentication (register / login)
- Role-based access control (admin vs user)
- Create / update / delete tasks
- Task assignment (admins can assign to any user)
- Task filters (search, status, priority, date range, assignee)
- Task comments (add & view)
- Responsive UI

Project structure (important folders)
```
frontend/          # React + Vite app
  src/
    api/            # axios client + API helpers
    components/     # TaskList, TaskForm, TaskBoard, etc.
    pages/          # Login, Register, Dashboard
backend/           # Express server
  models/           # Mongoose schemas (User, Task)
  routes/           # API routes (auth, tasks, users)
  middleware/       # Auth middleware
```

## Prerequisites
- Node.js (v14+)
- npm or pnpm
- MongoDB (local or Atlas)

## Quick start (development)

1. Start backend

```powershell
cd backend; npm install; cp .env.example .env  # then edit .env
npm run dev
```

2. Start frontend

```powershell
cd frontend; npm install; cp .env.example .env  # set VITE_API_URL
npm run dev
```

By default the backend runs on http://localhost:5000 and the frontend on http://localhost:3000 (unless you changed ports).

## Environment variables

Create a `.env` in `backend/` and in `frontend/` (frontend uses Vite envs starting with VITE_)

backend `.env` (example)
```
MONGODB_URI=mongodb://localhost:27017/task-management
JWT_SECRET=your_jwt_secret
PORT=5000
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=abcdefghijklmnoP

```

frontend `.env` (example)
```
VITE_API_URL=http://localhost:5000/api
```

## Backend details

- Entry point: `backend/server.js`
- Routes: `backend/routes`
  - `auth.js` — register / login
  - `tasks.js` — task CRUD + comments endpoints
  - `users.js` — user listing (admin) and profile
- Models: `backend/models`
  - `User.js` — user schema, roles and password hashing
  - `Task.js` — task schema with `comments` array

Important middleware: `backend/middleware/auth.js` which validates JWT and attaches `req.user`.

### Notable backend behavior
- When a non-admin creates a task without `assignedTo`, the task is assigned to the creator.
- Only admins may assign tasks to other users or reassign tasks.
- Authorization guards exist for updating and deleting tasks (creator/assignee/admin rules).

## Frontend details

- Built with React + Vite and Tailwind.
- API helpers live in `frontend/src/api/` (notably `tasks.js`, `auth.js`, `users.js`). The axios client is configured to include the Authorization header.
- Key components:
  - `TaskList.jsx` — list view, now includes comments UI
  - `TaskForm.jsx` — create task form (admins can assign)
  - `TaskBoard.jsx` — kanban-style board
  - `TaskFilters.jsx` — search / filters

## API Reference

All endpoints are prefixed with `/api` (so the backend base URL is e.g. `http://localhost:5000/api`). Use `Authorization: Bearer <token>` for protected endpoints.

### Authentication

- POST /api/auth/register
  - Body: { name, email, password, role }
  - Returns: created user (usually returns token in response in this app flow)

- POST /api/auth/login
  - Body: { email, password }
  - Returns: { token, user }

### Tasks

- GET /api/tasks
  - Query params: status, priority, assignedTo, search, startDate, endDate
  - Example: `/api/tasks?status=open&priority=high&search=bug`
  - Returns: { tasks: [...] }

- POST /api/tasks
  - Body: { title, description, priority, dueDate, assignedTo }
  - Permissions: Authenticated users may create tasks. If `assignedTo` is provided and it's not the creator, the creator must be an admin.
  - Returns: { task }

- PATCH /api/tasks/:id
  - Body: { title, description, status, priority, dueDate, assignedTo }
  - Permissions: only assignee, creator or admin can update (reassignment restricted to admin)
  - Returns: { task }

- DELETE /api/tasks/:id
  - Permissions: only creator or admin
  - Returns: { message }

#### Comments (new)

- GET /api/tasks/:id/comments
  - Returns: { comments: [ { _id, userId: { id, email, name }, text, createdAt }, ... ] }
  - Populates comment author (`comments.userId`) with brief user info.

- POST /api/tasks/:id/comments
  - Body: { text }
  - Adds a comment by the authenticated user and returns the created comment: { comment }
  - Permissions: any authenticated user can comment by default. You can add extra checks if you want to restrict commenting to assignees/creators.

### Users

- GET /api/users
  - Admin only — returns the list of users.

- GET /api/users/me
  - Returns current user profile based on token.

