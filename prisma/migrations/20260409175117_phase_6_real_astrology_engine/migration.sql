-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "chartData" JSONB,
ADD COLUMN     "dob" TEXT,
ADD COLUMN     "latitude" DECIMAL(9,6),
ADD COLUMN     "longitude" DECIMAL(9,6),
ADD COLUMN     "tob" TEXT;
