-- AlterTable
ALTER TABLE "Interview" ALTER COLUMN "messages" SET DEFAULT '[]',
ALTER COLUMN "userInfo" SET DEFAULT '{"name": "", "email": "", "phone": "", "skills": [], "experience": [], "projects": []}';
