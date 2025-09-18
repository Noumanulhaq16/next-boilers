-- DropForeignKey
ALTER TABLE "ReportMedia" DROP CONSTRAINT "ReportMedia_reportId_fkey";

-- DropForeignKey
ALTER TABLE "ReportMedia" DROP CONSTRAINT "ReportMedia_mediaId_fkey";

-- DropTable
DROP TABLE "ReportMedia";

