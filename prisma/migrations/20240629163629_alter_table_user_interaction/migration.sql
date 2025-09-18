/*
  Warnings:

  - You are about to drop the column `status` on the `UserInteraction` table. All the data in the column will be lost.
  - Added the required column `type` to the `UserInteraction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserInteractionType" AS ENUM ('LIKED', 'DISLIKED');

-- AlterTable
ALTER TABLE "UserInteraction" DROP COLUMN "status",
ADD COLUMN     "type" "UserInteractionType" NOT NULL;

-- DropEnum
DROP TYPE "UserInteractionStatus";
