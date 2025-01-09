-- CreateTable
CREATE TABLE "Safe" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "iv" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Safe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Safe_email_key" ON "Safe"("email");
