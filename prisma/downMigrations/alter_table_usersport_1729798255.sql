-- DropForeignKey
ALTER TABLE "UserSport" DROP CONSTRAINT "UserSport_sportId_fkey";

-- DropForeignKey
ALTER TABLE "UserSport" DROP CONSTRAINT "UserSport_userId_fkey";

-- DropTable
DROP TABLE "UserSport";

-- CreateTable
CREATE TABLE "UserSportPostion" (
    "id" SERIAL NOT NULL,
    "sportId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "sportGender" "SportGender"[],
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "UserSportPostion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserSportPostion" ADD CONSTRAINT "UserSportPostion_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSportPostion" ADD CONSTRAINT "UserSportPostion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

