-- CreateTable
CREATE TABLE "MemberJoin" (
    "id" VARCHAR(255) NOT NULL,
    "circleId" VARCHAR(255) NOT NULL,
    "joined" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MemberJoin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MemberJoin_circleId_key" ON "MemberJoin"("circleId");

-- CreateIndex
CREATE INDEX "MemberJoin_joined_idx" ON "MemberJoin"("joined");

-- AddForeignKey
ALTER TABLE "MemberJoin" ADD CONSTRAINT "MemberJoin_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "Circle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
