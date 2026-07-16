/*
  Warnings:

  - Added the required column `embedding` to the `DocumentChunk` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DocumentChunk" ADD COLUMN     "dimensions" INTEGER NOT NULL DEFAULT 768,
ADD COLUMN     "embedding" vector(768) NOT NULL,
ADD COLUMN     "model" TEXT NOT NULL DEFAULT 'gemini-embedding-2';
