-- DropForeignKey
ALTER TABLE "UserInteraction" DROP CONSTRAINT "UserInteraction_subjectUserId_fkey";

-- DropForeignKey
ALTER TABLE "UserInteraction" DROP CONSTRAINT "UserInteraction_objectUserId_fkey";

-- DropTable
DROP TABLE "UserInteraction";

-- DropEnum
DROP TYPE "UserInteractionStatus";

