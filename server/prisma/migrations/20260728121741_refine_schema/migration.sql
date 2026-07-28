/*
  Warnings:

  - You are about to drop the column `key` on the `AudioAnalysis` table. All the data in the column will be lost.
  - The `preferredModel` column on the `UserSettings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `musicalKey` to the `AudioAnalysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `AudioAnalysis` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `mode` on the `AudioAnalysis` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `MusicFile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MusicalMode" AS ENUM ('MAJOR', 'MINOR');

-- CreateEnum
CREATE TYPE "ModelType" AS ENUM ('TENSORFLOW');

-- AlterTable
ALTER TABLE "AudioAnalysis" DROP COLUMN "key",
ADD COLUMN     "musicalKey" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "mode",
ADD COLUMN     "mode" "MusicalMode" NOT NULL;

-- AlterTable
ALTER TABLE "MusicFile" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "UserSettings" DROP COLUMN "preferredModel",
ADD COLUMN     "preferredModel" "ModelType" NOT NULL DEFAULT 'TENSORFLOW';
