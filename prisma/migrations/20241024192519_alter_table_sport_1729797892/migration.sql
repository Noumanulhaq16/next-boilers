/*
  Warnings:

  - You are about to drop the column `sportId` on the `UserInfo` table. All the data in the column will be lost.
  - You are about to drop the column `sportPositionId` on the `UserInfo` table. All the data in the column will be lost.
  - You are about to drop the `SportPostion` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `Sport` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SportType" AS ENUM ('INDIVIDUAL', 'TEAM');

-- CreateEnum
CREATE TYPE "SportGender" AS ENUM ('BOY', 'GIRL');

-- DropForeignKey
ALTER TABLE "SportPostion" DROP CONSTRAINT "SportPostion_sportId_fkey";

-- DropForeignKey
ALTER TABLE "UserInfo" DROP CONSTRAINT "UserInfo_sportId_fkey";

-- DropForeignKey
ALTER TABLE "UserInfo" DROP CONSTRAINT "UserInfo_sportPositionId_fkey";

-- AlterTable
ALTER TABLE "Sport" ADD COLUMN     "sportGender" "SportGender"[],
ADD COLUMN     "type" "SportType" NOT NULL;

-- AlterTable
ALTER TABLE "UserInfo" DROP COLUMN "sportId",
DROP COLUMN "sportPositionId";

-- DropTable
DROP TABLE "SportPostion";

-- CreateTable
CREATE TABLE "UserSportPostion" (
    "id" SERIAL NOT NULL,
    "sportId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "sportGender" "SportGender"[],
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "UserSportPostion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserSportPostion" ADD CONSTRAINT "UserSportPostion_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSportPostion" ADD CONSTRAINT "UserSportPostion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
