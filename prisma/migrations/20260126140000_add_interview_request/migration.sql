-- CreateTable
CREATE TABLE "interview_requests" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "locationType" TEXT NOT NULL,
    "location" TEXT,
    "message" TEXT,
    "timeSlots" JSONB NOT NULL,
    "selectedSlot" INTEGER,
    "alternativeSlot" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "interview_requests_applicationId_key" ON "interview_requests"("applicationId");

-- AddForeignKey
ALTER TABLE "interview_requests" ADD CONSTRAINT "interview_requests_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

