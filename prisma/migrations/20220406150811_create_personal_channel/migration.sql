-- CreateTable
CREATE TABLE "PersonalChannel" (
    "id" VARCHAR(255) NOT NULL,
    "memberId" VARCHAR(255) NOT NULL,

    CONSTRAINT "PersonalChannel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PersonalChannel_memberId_id_idx" ON "PersonalChannel"("memberId", "id");

-- AddForeignKey
ALTER TABLE "PersonalChannel" ADD CONSTRAINT "PersonalChannel_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
