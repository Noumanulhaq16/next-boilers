-- DropForeignKey
ALTER TABLE "UserSportPostion" DROP CONSTRAINT "UserSportPostion_sportId_fkey";

-- DropForeignKey
ALTER TABLE "UserSportPostion" DROP CONSTRAINT "UserSportPostion_userId_fkey";

-- AlterTable
ALTER TABLE "UserInfo" ADD COLUMN     "sportId" INTEGER,
ADD COLUMN     "sportPositionId" INTEGER;

-- AlterTable
ALTER TABLE "Sport" DROP COLUMN "sportGender",
DROP COLUMN "type";

-- DropTable
DROP TABLE "UserSportPostion";

-- DropEnum
DROP TYPE "SportType";

-- DropEnum
DROP TYPE "SportGender";

-- CreateTable
CREATE TABLE "SportPostion" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "sportId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "SportPostion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SportPostion" ADD CONSTRAINT "SportPostion_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInfo" ADD CONSTRAINT "UserInfo_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInfo" ADD CONSTRAINT "UserInfo_sportPositionId_fkey" FOREIGN KEY ("sportPositionId") REFERENCES "SportPostion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

