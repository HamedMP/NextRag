-- CreateTable
CREATE TABLE "oai" (
    "id" BIGSERIAL NOT NULL,
    "chunk" TEXT,
    "embedding" vector,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oai_pkey" PRIMARY KEY ("id")
);
