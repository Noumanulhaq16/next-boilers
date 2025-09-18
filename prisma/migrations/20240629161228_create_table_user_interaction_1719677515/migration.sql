-- CreateEnum
CREATE TYPE "UserInteractionStatus" AS ENUM ('LIKED', 'DISLIKED');

-- CreateTable
CREATE TABLE "UserInteraction" (
    "id" SERIAL NOT NULL,
    "subjectUserId" INTEGER NOT NULL,
    "objectUserId" INTEGER NOT NULL,
    "status" "UserRelationshipStatus" NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "UserInteraction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserInteraction" ADD CONSTRAINT "UserInteraction_subjectUserId_fkey" FOREIGN KEY ("subjectUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInteraction" ADD CONSTRAINT "UserInteraction_objectUserId_fkey" FOREIGN KEY ("objectUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
