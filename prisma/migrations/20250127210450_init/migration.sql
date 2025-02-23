-- CreateTable
CREATE TABLE "Safe" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "email" VARCHAR(255) NOT NULL,
    "hash" VARCHAR(32) NOT NULL,
    "passkeys" TEXT NOT NULL,
    "currentChallenge" VARCHAR(255) NULL,
    "encrypted" TEXT NOT NULL,

    CONSTRAINT "Safe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Safe_email_key" ON "Safe"("email");
