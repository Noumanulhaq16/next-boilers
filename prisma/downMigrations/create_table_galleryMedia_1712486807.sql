-- DropForeignKey
ALTER TABLE "GalleryMedia" DROP CONSTRAINT "GalleryMedia_userId_fkey";

-- DropForeignKey
ALTER TABLE "GalleryMedia" DROP CONSTRAINT "GalleryMedia_mediaId_fkey";

-- DropTable
DROP TABLE "GalleryMedia";

