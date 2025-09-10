-- AlterTable
ALTER TABLE "invoices" ADD COLUMN "paidDate" DATETIME;

-- CreateTable
CREATE TABLE "work_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "breakDuration" INTEGER NOT NULL DEFAULT 0,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "work_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "work_sessions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "freelance_projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_freelance_projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "hourlyRate" INTEGER NOT NULL,
    "totalHours" REAL NOT NULL DEFAULT 0,
    "paidHours" REAL NOT NULL DEFAULT 0,
    "unpaidHours" REAL NOT NULL DEFAULT 0,
    "totalAmount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "freelance_projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_freelance_projects" ("client", "createdAt", "hourlyRate", "id", "name", "status", "totalAmount", "totalHours", "updatedAt", "userId") SELECT "client", "createdAt", "hourlyRate", "id", "name", "status", "totalAmount", "totalHours", "updatedAt", "userId" FROM "freelance_projects";
DROP TABLE "freelance_projects";
ALTER TABLE "new_freelance_projects" RENAME TO "freelance_projects";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
