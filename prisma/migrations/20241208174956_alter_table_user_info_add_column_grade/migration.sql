-- CreateEnum
CREATE TYPE "UserGrade" AS ENUM ('FRESHMAN', 'SOPHOMORE', 'JUNIOR', 'SENIOR');

-- AlterTable
ALTER TABLE "UserInfo" ADD COLUMN     "grade" "UserGrade";
