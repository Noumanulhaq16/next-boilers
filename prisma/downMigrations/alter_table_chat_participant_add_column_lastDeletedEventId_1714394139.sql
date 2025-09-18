-- DropForeignKey
ALTER TABLE "ChatParticipant" DROP CONSTRAINT "ChatParticipant_lastDeletedEventId_fkey";

-- AlterTable
ALTER TABLE "ChatParticipant" DROP COLUMN "lastDeletedEventId";

