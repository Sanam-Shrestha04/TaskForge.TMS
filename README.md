# TaskForge – "Task Management System"

TaskForge is a full-stack task management platform built using the MERN stack (MongoDB, Express.js, React, Node.js). It empowers teams to collaborate efficiently, track progress, and manage tasks with clarity and precision.

> BSc CSIT 7th Semester Project  
> Prepared by: Jenisha, Sanam and Swechhya

---

## Live Deployment

[View TaskForge Online](https://task-forge-tms-xln6.vercel.app/login)

---

## Features

- **User Dashboard** – View assigned tasks, track progress, and get task insights
- **Task Management** – Create, update, and track tasks with due dates and priorities
- **Automated Status Updates** – Task status changes automatically based on checklist completion
- **Team Collaboration** – Assign tasks to multiple users and monitor completion
- **Priority & Progress Tracking** – Categorize tasks by priority and visualize progress
- **Task Report Downloads** – Export task data for analysis and tracking
- **Attachments Support** – Add and access task-related file links easily
- **Mobile Responsive UI** – Seamless experience across desktop, tablet, and mobile

---

## Tech Stack

| Layer        | Technology                |
| ------------ | ------------------------- |
| Frontend     | React, Vite, Tailwind CSS |
| Backend      | Node.js, Express.js       |
| Database     | MongoDB (Mongoose)        |
| Auth         | JWT Authentication        |
| Styling      | Tailwind CSS              |
| File Uploads | Multer                    |
| Deploy       | Vercel                    |

---

## Project Structure

TaskForge
├── frontend/ # React + Vite + Tailwind UI
│ ├──node_modules/ # Installed dependencies (auto-generated)
| ├──public/ # Static assets (e.g., vite.svg)
│ ├── src/
│ │ ├── assets/ # Images, fonts, icons
│ │ ├── components/ # Reusable UI elements
│ │ ├── context/ # Global state (e.g., userContext)
│ │ ├── hooks/ # Custom hooks (e.g., useUserAuth)
│ │ ├── pages/ # Views: Admin, Auth, User
│ │ ├── routes/ # Protected routes (e.g., PrivateRoute)
│ │ ├── src/ # Type declarations for icon libraries
│ │ ├── utils/ # API paths, Axios, helpers, validation
│ │ ├── App.jsx # Root component
│ │ ├── index.css # Tailwind base styles
│ │ ├── main.jsx # React DOM entry
│ │── .gitignore # Git hygiene for frontend
│ ├── eslint.config.js # ESLint rules for code quality and consistency
│ ├── index.html # HTML entry point for the app
│ ├── package-lock.json # Exact versions of installed packages
│ ├── package.json # Project metadata and frontend dependencies
│ ├── tailwind.config.js # Tailwind CSS customization
│ └── vite.config.js # Vite build and dev server configuration
├── backend/ # Node.js + Express API
│ ├── config/ # DB connection (e.g., db.js)
│ ├── controllers/ # Logic for auth, tasks, reports
│ ├── middlewares/ # Auth and file upload handlers
│ ├── models/ # Mongoose schemas (User, Task)
│ ├── routes/ # API endpoints (auth, task, new)
│ ├── uploads/ # Uploaded files or references
│ ├── server.js # Express app entry point
│ ├── package.json # Backend dependencies
│ ├── package-lock.json # Exact versions of installed packages
│ ├── .env # Environment variables
│ └── .gitignore # Git hygiene for backend
└── README.md # Project overview and setup guide

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Sanam-Shrestha04/TaskForge.git
cd Taskforge
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Setup Backend

```bash
cd backend
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file inside `/backend` based on the following template:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

---

## Acknowledgements

Special thanks to our mentor Mr. Sanjay Niraula sir, faculty and peers who supported us. TaskForge reflects our passion for building scalable, user-friendly software.

```

---
```
