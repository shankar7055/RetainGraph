-- CreateTable
CREATE TABLE "CustomerHealth" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "confidence" TEXT NOT NULL,
    "rootCauses" TEXT NOT NULL,
    "recommendedAction" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustomerHealth_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
