/*
  Warnings:

  - You are about to drop the `UserSportPostion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserSportPostion" DROP CONSTRAINT "UserSportPostion_sportId_fkey";

-- DropForeignKey
ALTER TABLE "UserSportPostion" DROP CONSTRAINT "UserSportPostion_userId_fkey";

-- DropTable
DROP TABLE "UserSportPostion";

-- CreateTable
CREATE TABLE "UserSport" (
    "id" SERIAL NOT NULL,
    "sportId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "sportGender" "SportGender"[],
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "UserSport_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserSport" ADD CONSTRAINT "UserSport_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSport" ADD CONSTRAINT "UserSport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
