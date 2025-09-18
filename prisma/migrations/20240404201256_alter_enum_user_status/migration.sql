-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "status" SET DEFAULT 'REGISTERING';
