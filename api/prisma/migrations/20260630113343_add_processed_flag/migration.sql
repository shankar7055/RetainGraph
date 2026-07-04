-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClientInteraction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payload" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClientInteraction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ClientInteraction" ("createdAt", "id", "payload", "tenantId") SELECT "createdAt", "id", "payload", "tenantId" FROM "ClientInteraction";
DROP TABLE "ClientInteraction";
ALTER TABLE "new_ClientInteraction" RENAME TO "ClientInteraction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
