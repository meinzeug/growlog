-- CreateTable
CREATE TABLE "EnvironmentMetric" (
    "id" TEXT NOT NULL,
    "grow_id" TEXT NOT NULL,
    "temperature_c" DOUBLE PRECISION,
    "humidity_pct" DOUBLE PRECISION,
    "co2_ppm" DOUBLE PRECISION,
    "vpd" DOUBLE PRECISION,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnvironmentMetric_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EnvironmentMetric" ADD CONSTRAINT "EnvironmentMetric_grow_id_fkey" FOREIGN KEY ("grow_id") REFERENCES "Grow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
