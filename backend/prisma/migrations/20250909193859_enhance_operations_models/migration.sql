-- AlterTable
ALTER TABLE "orders" ADD COLUMN "actualHours" REAL;
ALTER TABLE "orders" ADD COLUMN "clientEmail" TEXT;
ALTER TABLE "orders" ADD COLUMN "clientName" TEXT;
ALTER TABLE "orders" ADD COLUMN "estimatedHours" REAL;
ALTER TABLE "orders" ADD COLUMN "profitMargin" REAL;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "dueDate" DATETIME,
    "assignedTo" TEXT,
    "orderId" TEXT,
    "workshopId" TEXT,
    "estimatedHours" REAL,
    "actualHours" REAL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tasks_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tasks_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_tasks" ("assignedTo", "createdAt", "description", "dueDate", "id", "orderId", "status", "title", "updatedAt", "userId", "workshopId") SELECT "assignedTo", "createdAt", "description", "dueDate", "id", "orderId", "status", "title", "updatedAt", "userId", "workshopId" FROM "tasks";
DROP TABLE "tasks";
ALTER TABLE "new_tasks" RENAME TO "tasks";
CREATE TABLE "new_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "cleared" BOOLEAN NOT NULL DEFAULT false,
    "recurringId" TEXT,
    "orderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_transactions" ("accountId", "amount", "categoryId", "cleared", "createdAt", "date", "description", "id", "recurringId", "type", "updatedAt", "userId") SELECT "accountId", "amount", "categoryId", "cleared", "createdAt", "date", "description", "id", "recurringId", "type", "updatedAt", "userId" FROM "transactions";
DROP TABLE "transactions";
ALTER TABLE "new_transactions" RENAME TO "transactions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
