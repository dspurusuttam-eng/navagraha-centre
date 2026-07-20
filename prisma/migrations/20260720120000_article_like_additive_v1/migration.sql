-- CreateTable
CREATE TABLE "article_like" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "deviceHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_like_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "article_like_articleId_idx" ON "article_like"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "article_like_articleId_deviceHash_key" ON "article_like"("articleId", "deviceHash");

-- AddForeignKey
ALTER TABLE "article_like" ADD CONSTRAINT "article_like_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

