-- AlterTable
ALTER TABLE "ChatParticipant" ADD COLUMN     "lastDeletedEventId" INTEGER;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_lastDeletedEventId_fkey" FOREIGN KEY ("lastDeletedEventId") REFERENCES "ChatEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
