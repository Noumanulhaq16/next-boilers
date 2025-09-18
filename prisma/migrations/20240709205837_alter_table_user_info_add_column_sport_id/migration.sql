-- AlterTable
ALTER TABLE "UserInfo" ADD COLUMN     "sportId" INTEGER,
ADD COLUMN     "sportPositionId" INTEGER;

-- AddForeignKey
ALTER TABLE "UserInfo" ADD CONSTRAINT "UserInfo_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInfo" ADD CONSTRAINT "UserInfo_sportPositionId_fkey" FOREIGN KEY ("sportPositionId") REFERENCES "SportPostion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
