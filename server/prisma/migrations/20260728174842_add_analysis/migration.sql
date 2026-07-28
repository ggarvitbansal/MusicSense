-- CreateTable
CREATE TABLE "Analysis" (
    "id" UUID NOT NULL,
    "audioFileId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "filename" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "audioFeatures" JSONB NOT NULL,
    "musicDNA" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_audioFileId_key" ON "Analysis"("audioFileId");

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_audioFileId_fkey" FOREIGN KEY ("audioFileId") REFERENCES "AudioFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
