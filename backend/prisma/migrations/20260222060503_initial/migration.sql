-- CreateTable
CREATE TABLE "releases" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "additional_info" TEXT,
    "steps_completed" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "releases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "releases_date_idx" ON "releases"("date" DESC);
