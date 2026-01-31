-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('INDOOR', 'OUTDOOR');

-- CreateEnum
CREATE TYPE "Medium" AS ENUM ('SOIL', 'COCO', 'HYDRO', 'OTHER');

-- CreateEnum
CREATE TYPE "PlantTypeEnum" AS ENUM ('PHOTOPERIOD', 'AUTOFLOWER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "PlantSex" AS ENUM ('FEMINIZED', 'REGULAR', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "PlantPhase" AS ENUM ('GERMINATION', 'VEGETATIVE', 'FLOWERING', 'DRYING', 'CURED', 'FINISHED');

-- CreateEnum
CREATE TYPE "PlantStatus" AS ENUM ('HEALTHY', 'ISSUES', 'SICK', 'HARVESTED', 'DEAD');

-- CreateEnum
CREATE TYPE "LeafLogType" AS ENUM ('NOTE', 'WATER', 'FEED', 'TRAINING', 'DEFOLIATION', 'TRANSPLANT', 'PEST', 'PH_ADJUST', 'LIGHT_CHANGE', 'OTHER');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('OPEN', 'DONE', 'SKIPPED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grow" (
    "id" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location_type" "LocationType" NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Environment" (
    "id" TEXT NOT NULL,
    "grow_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "medium" "Medium" NOT NULL,
    "light_schedule" TEXT,
    "temperature_target" DOUBLE PRECISION,
    "humidity_target" DOUBLE PRECISION,
    "notes" TEXT,

    CONSTRAINT "Environment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plant" (
    "id" TEXT NOT NULL,
    "grow_id" TEXT NOT NULL,
    "environment_id" TEXT,
    "owner_user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "strain" TEXT,
    "plant_type" "PlantTypeEnum" NOT NULL DEFAULT 'UNKNOWN',
    "sex" "PlantSex" NOT NULL DEFAULT 'UNKNOWN',
    "start_date" DATE,
    "phase" "PlantPhase" NOT NULL DEFAULT 'GERMINATION',
    "phase_started_at" DATE,
    "status" "PlantStatus" NOT NULL DEFAULT 'HEALTHY',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantLog" (
    "id" TEXT NOT NULL,
    "plant_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "logged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "LeafLogType" NOT NULL DEFAULT 'NOTE',
    "title" TEXT,
    "content" TEXT,
    "tags" TEXT[],
    "metrics_json" JSONB,

    CONSTRAINT "PlantLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantPhoto" (
    "id" TEXT NOT NULL,
    "plant_id" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "taken_at" TIMESTAMP(3),
    "file_path" TEXT NOT NULL,
    "caption" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlantPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "grow_id" TEXT,
    "plant_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "due_at" TIMESTAMP(3) NOT NULL,
    "repeat_rule" TEXT,
    "notify" BOOLEAN NOT NULL DEFAULT false,
    "notify_before_minutes" INTEGER,
    "status" "TaskStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantMetric" (
    "id" TEXT NOT NULL,
    "plant_id" TEXT NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "height_cm" DOUBLE PRECISION,
    "ph" DOUBLE PRECISION,
    "ec" DOUBLE PRECISION,
    "temperature_c" DOUBLE PRECISION,
    "humidity_pct" DOUBLE PRECISION,
    "notes" TEXT,

    CONSTRAINT "PlantMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Grow" ADD CONSTRAINT "Grow_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Environment" ADD CONSTRAINT "Environment_grow_id_fkey" FOREIGN KEY ("grow_id") REFERENCES "Grow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_grow_id_fkey" FOREIGN KEY ("grow_id") REFERENCES "Grow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_environment_id_fkey" FOREIGN KEY ("environment_id") REFERENCES "Environment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantLog" ADD CONSTRAINT "PlantLog_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantLog" ADD CONSTRAINT "PlantLog_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantPhoto" ADD CONSTRAINT "PlantPhoto_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantPhoto" ADD CONSTRAINT "PlantPhoto_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_grow_id_fkey" FOREIGN KEY ("grow_id") REFERENCES "Grow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "Plant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantMetric" ADD CONSTRAINT "PlantMetric_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
