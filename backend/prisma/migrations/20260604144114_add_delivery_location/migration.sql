-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "area" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "deliveryLat" DOUBLE PRECISION,
ADD COLUMN     "deliveryLng" DOUBLE PRECISION,
ADD COLUMN     "deliveryMapUrl" TEXT,
ADD COLUMN     "postalCode" TEXT;
