/*
  Warnings:

  - You are about to drop the column `refreshTokenHash` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "refreshTokenHash",
ADD COLUMN     "refreshToken" TEXT;
