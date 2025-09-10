-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "attestationQuote" TEXT,
    "eventLog" TEXT,
    "applicationData" TEXT,
    "address" TEXT,
    "publicKey" TEXT,
    "message" TEXT,
    "signature" TEXT,
    "attestationChecksum" TEXT,
    "phalaVerificationUrl" TEXT,
    "t16zVerificationUrl" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'pending',
    "quoteUploadedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AuditLog" ("address", "applicationData", "attestationQuote", "createdAt", "eventLog", "id", "message", "operation", "publicKey", "signature", "userId") SELECT "address", "applicationData", "attestationQuote", "createdAt", "eventLog", "id", "message", "operation", "publicKey", "signature", "userId" FROM "AuditLog";
DROP TABLE "AuditLog";
ALTER TABLE "new_AuditLog" RENAME TO "AuditLog";
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_operation_idx" ON "AuditLog"("operation");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");
CREATE INDEX "AuditLog_attestationChecksum_idx" ON "AuditLog"("attestationChecksum");
CREATE INDEX "AuditLog_verificationStatus_idx" ON "AuditLog"("verificationStatus");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
