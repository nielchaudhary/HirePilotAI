
- **tech**: React, Node, PostgreSQL, Prisma


 **prerequisites**:
- Node.js v18+
- npm v9+ or pnpm (recommended)
- Supabase account (free tier works)


**Clone and Install:**
```bash
git clone <repository-url>
cd HirePilotAI
```

**BE Setup:**
```bash
cd backend
pnpm install  # or npm install
```

**FE Setup:**
```bash
cd ../frontend
pnpm install  # or npm install
```


**.env:**

```env
# Supabase Connection
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# OpenRouter API
OPENROUTER_API_KEY="your-api-key-here"
```

**DB Setup**

**Initialize Prisma**:
   ```bash
   cd backend/src/prisma
   npx prisma db push
   npx prisma generate
   ```


## 🏃 Running the Application

| Command               | Action                              |
|-----------------------|-------------------------------------|
| `pnpm dev` (backend)  | Starts backend dev server           |
| `pnpm dev` (frontend) | Starts frontend dev server (Port 5173) |
| `pnpm build`          | Creates production build            |




