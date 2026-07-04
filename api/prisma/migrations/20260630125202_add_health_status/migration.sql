-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CustomerHealth" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "confidence" TEXT NOT NULL,
    "rootCauses" TEXT NOT NULL,
    "recommendedAction" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "correctionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustomerHealth_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CustomerHealth" ("confidence", "createdAt", "id", "recommendedAction", "riskScore", "rootCauses", "tenantId") SELECT "confidence", "createdAt", "id", "recommendedAction", "riskScore", "rootCauses", "tenantId" FROM "CustomerHealth";
DROP TABLE "CustomerHealth";
ALTER TABLE "new_CustomerHealth" RENAME TO "CustomerHealth";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
