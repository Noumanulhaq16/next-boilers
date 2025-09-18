-- AlterEnum
BEGIN;
CREATE TYPE "UserOAuthType_new" AS ENUM ('GOOGLE', 'APPLE');
ALTER TABLE "UserOAuth" ALTER COLUMN "type" TYPE "UserOAuthType_new" USING ("type"::text::"UserOAuthType_new");
ALTER TYPE "UserOAuthType" RENAME TO "UserOAuthType_old";
ALTER TYPE "UserOAuthType_new" RENAME TO "UserOAuthType";
DROP TYPE "UserOAuthType_old";
COMMIT;

