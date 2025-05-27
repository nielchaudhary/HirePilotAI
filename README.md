# HirePilotAI

Welcome to the HirePilotAI project! This is a full-stack application built with React/TypeScript on the frontend and Node.js/Express with Prisma on the backend.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Node.js (v18 or later recommended)
- npm (v9 or later) or pnpm (recommended)
- PostgreSQL (for the database)
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```
   or if you prefer npm:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy the `.env` file from a team member or create a new one based on `.env.example`
   - Configure your database connection string and other required environment variables

4. Set up the database:
   ```bash
   npx prisma migrate dev --name init
   ```
   This will create and apply the database migrations.

5. Start the development server:
   ```bash
   pnpm dev
   ```
   or
   ```bash
   npm run dev
   ```

### 3. Frontend Setup

1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   or if you prefer pnpm:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   or
   ```bash
   pnpm dev
   ```

4. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal)

## Available Scripts

### Backend
- `pnpm dev`: Start the development server with hot-reload //use this to run the application
- `pnpm build`: Build the TypeScript code
- `pnpm start`: Start the production server
- `pnpm lint:check`: Run ESLint to check for code quality issues
- `npx prisma studio`: Open Prisma Studio for database management

### Frontend
- `npm run dev`: Start the development server //to run the frontend
- `npm run build`: Build the application for production
- `npm run preview`: Preview the production build locally
- `npm run lint`: Run ESLint

## Environment Variables

### Backend
Create a `.env` file in the `backend` directory with the following variables:

```

Your Supabase DB Url :
DATABASE_URL="postgresql://user:password@localhost:5432/ninja?schema=public"

Your OpenRouter API Key
OPENROUTER_API_KEY="your-openrouter-api-key"

# Add other required environment variables here
```


## Database

This project uses PostgreSQL with Prisma ORM. After setting up your `.env` file with the correct `DATABASE_URL`.

Here's a clean, concise **README.md** template for your project, explaining how to set it up with a new Supabase Postgres database:

---

# Project Setup Guide

This project uses **Supabase (Postgres)** + **Prisma** for the database layer. Follow these steps to run it with your own Supabase instance.

## Prerequisites
- Node.js (v18+ recommended)
- A Supabase account ([sign up here](https://supabase.com))

---

## 1. Set Up Supabase Postgres Database
1. Create a new project at [Supabase Dashboard](https://app.supabase.com/projects).
2. Go to **Settings → Database**, click on "Connect" and copy your connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

## 2. Configure Environment


DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

*(Replace values in square brackets with your actual credentials.)*


## 4. Set Up Database
Push the schema to your Supabase database:
```bash
npx prisma db push
```

(Optional) Seed sample data if available:
```bash
npx prisma db seed
```

## 5. Generate Prisma Client
```bash
npx prisma generate
```

## 6. Run the Project
```bash
npm run dev
# or check package.json for custom commands
```


## Project Structure
```
/prisma
  schema.prisma    # Database schema definition
  /migrations     # Migration history (if applicable)
.env.example      # Environment template
```

---

