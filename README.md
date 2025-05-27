
# HirePilotAI 🚀

A full-stack recruitment automation platform built with:
- **Frontend**: React + TypeScript
- **Backend**: Node.js/Express
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma

![Tech Stack](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm v9+ or pnpm (recommended)
- Supabase account (free tier works)

### 1. Clone & Install
```bash
git clone <repository-url>
cd HirePilotAI
```

### 2. Backend Setup
```bash
cd backend
pnpm install  # or npm install
```

### 3. Frontend Setup
```bash
cd ../frontend
pnpm install  # or npm install
```

## ⚙️ Configuration

### Environment Variables
Create `.env` files in both `backend` and `frontend` directories based on the provided `.env.example` files.

#### Backend Essentials:
```env
# Supabase Connection
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# OpenRouter API
OPENROUTER_API_KEY="your-api-key-here"
```

## 🗄 Database Setup

1. **Initialize Prisma**:
   ```bash
   cd backend/src/prisma
   npx prisma db push
   npx prisma generate
   ```
2. Access Prisma Studio:
   ```bash
   npx prisma studio
   ```

## 🏃 Running the Application

| Command               | Action                              |
|-----------------------|-------------------------------------|
| `pnpm dev` (backend)  | Starts backend dev server           |
| `pnpm dev` (frontend) | Starts frontend dev server (Port 5173) |
| `pnpm build`          | Creates production build            |

Access the app at: [http://localhost:5173](http://localhost:5173)

## 📂 Project Structure

```
HirePilotAI/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── src/
│   │   └── ...              # Backend source code
│   └── .env.example         # Backend env template
├── frontend/
│   ├── public/
│   ├── src/
│   │   └── ...              # Frontend source code
│   └── .env.example         # Frontend env template
└── README.md                # This file
```

## 🔧 Troubleshooting

- **Database connection issues**: Verify your Supabase credentials and ensure the database is running
- **Prisma errors**: Run `npx prisma generate` after schema changes
- **Missing dependencies**: Delete `node_modules` and re-run `pnpm install`

