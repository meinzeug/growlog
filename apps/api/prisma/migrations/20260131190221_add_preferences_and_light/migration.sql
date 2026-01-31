-- AlterTable
ALTER TABLE "PlantMetric" ADD COLUMN     "light_ppfd" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "preferences" JSONB;
