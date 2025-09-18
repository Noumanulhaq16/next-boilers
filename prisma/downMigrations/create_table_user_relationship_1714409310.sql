-- DropForeignKey
ALTER TABLE "UserRelationship" DROP CONSTRAINT "UserRelationship_subjectUserId_fkey";

-- DropForeignKey
ALTER TABLE "UserRelationship" DROP CONSTRAINT "UserRelationship_objectUserId_fkey";

-- DropTable
DROP TABLE "UserRelationship";

-- DropEnum
DROP TYPE "UserRelationshipStatus";

