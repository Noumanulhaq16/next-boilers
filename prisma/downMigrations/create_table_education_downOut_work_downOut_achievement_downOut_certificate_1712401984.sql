-- DropForeignKey
ALTER TABLE "WorkHistory" DROP CONSTRAINT "WorkHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "EducationHistory" DROP CONSTRAINT "EducationHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "Achievement" DROP CONSTRAINT "Achievement_userId_fkey";

-- DropForeignKey
ALTER TABLE "Certificate" DROP CONSTRAINT "Certificate_userId_fkey";

-- DropForeignKey
ALTER TABLE "Certificate" DROP CONSTRAINT "Certificate_mediaId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "about",
DROP COLUMN "firstName",
DROP COLUMN "height",
DROP COLUMN "lastName",
DROP COLUMN "weight",
ADD COLUMN     "name" TEXT;

-- DropTable
DROP TABLE "WorkHistory";

-- DropTable
DROP TABLE "EducationHistory";

-- DropTable
DROP TABLE "Achievement";

-- DropTable
DROP TABLE "Certificate";

