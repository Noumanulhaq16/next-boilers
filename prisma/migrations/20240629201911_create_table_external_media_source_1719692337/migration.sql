-- CreateTable
CREATE TABLE "ExternalMediaSource" (
    "id" SERIAL NOT NULL,
    "link" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "ExternalMediaSource_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExternalMediaSource" ADD CONSTRAINT "ExternalMediaSource_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
