-- AlterEnum
BEGIN;
CREATE TYPE "TokenReason_new" AS ENUM ('FORGOT_PASSWORD', 'RESET_PASSWORD', 'CHANGE_PASSWORD');
ALTER TABLE "Token" ALTER COLUMN "reason" TYPE "TokenReason_new" USING ("reason"::text::"TokenReason_new");
ALTER TYPE "TokenReason" RENAME TO "TokenReason_old";
ALTER TYPE "TokenReason_new" RENAME TO "TokenReason";
DROP TYPE "TokenReason_old";
COMMIT;

