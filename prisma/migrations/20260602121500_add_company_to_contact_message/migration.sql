-- AlterTable (idempotent: safe whether applied via CI migrate or manually)
ALTER TABLE "ContactMessage" ADD COLUMN IF NOT EXISTS "company" TEXT;
