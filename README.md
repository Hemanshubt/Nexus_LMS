# Nexus LMS Platform

A production-grade Learning Management System (LMS) SaaS platform built with specific focus on scalability, clean architecture, and modern tech stack.

## 🚀 Features

*   **User Roles**: Students, Instructors, and Admin.
*   **Course Management**: Create, edit, and publish courses with sections and lessons.
*   **Video Learning**: Interactive video player with progress tracking.
*   **Authentication**: Secure JWT-based auth with HTTP-only cookies.
*   **SaaS Ready**: Designed for multi-tenancy and scalability.

## 🛠️ Tech Stack

**Monorepo Structure**
*   **Package Manager**: `npm` (Workspaces)

**Backend** (`/server`)
*   **Runtime**: Node.js & Express
*   **Language**: TypeScript
*   **Database**: PostgreSQL
*   **ORM**: Prisma
*   **Auth**: JWT (Access + Refresh Tokens)
*   **Storage**: Cloudinary (Integration pending)

**Frontend** (`/client`)
*   **Framework**: React (Vite)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS + Shadcn/UI
*   **State**: Zustand + React Query
*   **Forms**: React Hook Form + Zod

## 📦 Prerequisites

*   Node.js (v18+)
*   PostgreSQL (Local or Cloud like Neon)

## ⚡ Getting Started

### 1. Clone & Install
```bash
git clone <repo-url>
cd LSM
npm install
```

### 2. Environment Setup

**Backend**
Create `server/.env`:
```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/lms_db"
JWT_SECRET="your_secret_key"
JWT_REFRESH_SECRET="your_refresh_secret"
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
ZF_URL="http://localhost:5173"
```

**Frontend**
Create `client/.env`:
```env
# No secrets needed yet, uses proxy or defaults
```

### 3. Database Setup
```bash
cd server
npx prisma generate
npx prisma db push
```

### 4. Run Locally
We use a concurrent runner script (optional) or run terminals separately.

**Terminal 1 (Backend)**
```bash
cd server
npm run dev
```
*Server runs on http://localhost:3000*

**Terminal 2 (Frontend)**
```bash
cd client
npm run dev
```
*Client runs on http://localhost:5173*

## 🧪 API Documentation

*   **Auth**: `/api/v1/auth/register`, `/login`, `/logout`
*   **Courses**: `/api/v1/courses` (GET, POST)
*   **Instructors**: `/api/v1/courses/:id/sections`, `/lessons`

## 🤝 Contribution

1.  Fork the repository
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request



 Access Credentials
Portal	Email	Password
Admin Panel	admin@nexus.com	 admin123
Instructor Panel	instructor@nexus.com	instructor123