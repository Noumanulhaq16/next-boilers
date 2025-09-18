-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_lastEventId_fkey";

-- DropForeignKey
ALTER TABLE "ChatParticipant" DROP CONSTRAINT "ChatParticipant_chatId_fkey";

-- DropForeignKey
ALTER TABLE "ChatParticipant" DROP CONSTRAINT "ChatParticipant_lastReadEventId_fkey";

-- DropForeignKey
ALTER TABLE "ChatParticipant" DROP CONSTRAINT "ChatParticipant_lastDeliveredEventId_fkey";

-- DropForeignKey
ALTER TABLE "ChatParticipant" DROP CONSTRAINT "ChatParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "ChatEvent" DROP CONSTRAINT "ChatEvent_chatId_fkey";

-- DropForeignKey
ALTER TABLE "ChatEvent" DROP CONSTRAINT "ChatEvent_senderParticipantId_fkey";

-- DropForeignKey
ALTER TABLE "ChatEventAttachment" DROP CONSTRAINT "ChatEventAttachment_eventId_fkey";

-- DropForeignKey
ALTER TABLE "ChatEventAttachment" DROP CONSTRAINT "ChatEventAttachment_mediaId_fkey";

-- DropTable
DROP TABLE "Chat";

-- DropTable
DROP TABLE "ChatParticipant";

-- DropTable
DROP TABLE "ChatEvent";

-- DropTable
DROP TABLE "ChatEventAttachment";

-- DropEnum
DROP TYPE "ChatType";

