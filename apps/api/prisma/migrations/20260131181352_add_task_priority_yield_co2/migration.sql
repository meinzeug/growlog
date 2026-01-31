-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "Environment" ADD COLUMN     "co2_target" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Plant" ADD COLUMN     "estimated_yield_grams" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM';
