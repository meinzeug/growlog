# GrowLog 🌿
> Professional Full-Stack Plant Management System

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

**GrowLog** is a data-driven grow tracking application designed for serious cultivators. It provides a secure, role-based environment to track plants from seed to harvest, monitor environmental metrics, and visualize progress through advanced charts.

---

## 📑 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)

---

## ✨ Features

- **🌱 Complete Lifecycle Tracking**: Track plants from Germination to Curing.
- **🔐 Role-Based Access Control (RBAC)**: Secure Admin and User roles with isolated data views.
- **📊 Environmental Metrics**: Log and chart pH, EC, Temperature, and Humidity.
- **📸 Photo Timeline**: Visual history of your plant's development.
- **📅 Task Management**: Scheduling and reminders for watering, feeding, and training.
- **🚀 Monorepo Architecture**: Modern codebase using workspace structure.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS (Modern, Responsive)
- **State/Data**: React Hook Form, Zod, Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT (Access Tokens)
- **Validation**: Zod (Shared schemas with Frontend)

### Infrastructure
- **Containerization**: Docker Compose
- **Process Management**: PM2

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/meinzeug/growlog.git
   cd growlog
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Infrastructure (Database)**
   ```bash
   docker compose up -d
   ```

4. **Initialize Database**
   Run migration and seed the database with the Admin user.
   ```bash
   # Run migrations from root workspace
   npm run prisma:migrate --workspace=apps/api
   
   # Seed default data
   npm run prisma:seed --workspace=apps/api
   ```
   *Note: Ensure `.env` is correctly set in `apps/api`.*

---

## 🖥 Usage

### Running Locally (Development)

You can run the full stack using our helper scripts.

**Option A: Standard Dev Mode** (Terminal attached)
```bash
npm run dev
```

**Option B: PM2 Background Mode** (Recommended for persistence)
```bash
# Start API, Web, and DB
npm run pm2:start

# Monitor logs and status
npm run pm2:monit

# Stop all services
npm run pm2:stop
```

### Access Points
| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | [http://localhost:15000](http://localhost:15000) | Main Web Application |
| **API** | [http://localhost:15100](http://localhost:15100) | Backend REST API |
| **Database** | `localhost:15432` | PostgreSQL |

### 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@example.com` | `Admin_1234!` |
| **User** | *(Register via UI)* | *(Self-defined)* |

---

## 📡 API Documentation

The API uses standard REST conventions. 
A sample request collection is available at [`apps/api/requests.http`](apps/api/requests.http) for use with the VS Code REST Client extension.

**Key Endpoints:**
- `POST /auth/register` - Create new user
- `POST /auth/login` - Authenticate
- `GET /grows` - List all projects
- `GET /plants` - List plants (filterable)

---

## 📂 Project Structure

```bash
growlog/
├── apps/
│   ├── api/            # Express Backend
│   └── web/            # React Frontend
├── packages/
│   └── shared/         # Shared Types & Schemas
├── docker-compose.yml  # Database Orchestration
└── ecosystem.config.js # PM2 Configuration
```

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
