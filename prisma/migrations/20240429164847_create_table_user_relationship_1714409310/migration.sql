-- CreateEnum
CREATE TYPE "UserRelationshipStatus" AS ENUM ('BLOCKED');

-- CreateTable
CREATE TABLE "UserRelationship" (
    "id" SERIAL NOT NULL,
    "subjectUserId" INTEGER NOT NULL,
    "objectUserId" INTEGER NOT NULL,
    "status" "UserRelationshipStatus" NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "UserRelationship_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserRelationship" ADD CONSTRAINT "UserRelationship_subjectUserId_fkey" FOREIGN KEY ("subjectUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRelationship" ADD CONSTRAINT "UserRelationship_objectUserId_fkey" FOREIGN KEY ("objectUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
