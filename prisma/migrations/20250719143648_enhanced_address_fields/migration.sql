/*
  Warnings:

  - You are about to drop the column `address` on the `schools` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `teachers` table. All the data in the column will be lost.
  - Added the required column `city` to the `schools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postalCode` to the `schools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolType` to the `schools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `streetAddress` to the `schools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `teachers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `teachers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schools" DROP COLUMN "address",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "established" TIMESTAMP(3),
ADD COLUMN     "phoneCountryCode" TEXT NOT NULL DEFAULT '+1',
ADD COLUMN     "postalCode" TEXT NOT NULL,
ADD COLUMN     "schoolType" TEXT NOT NULL,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "streetAddress" TEXT NOT NULL,
ADD COLUMN     "studentCount" INTEGER;

-- AlterTable
ALTER TABLE "teachers" DROP COLUMN "location",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "phoneCountryCode" TEXT NOT NULL DEFAULT '+1',
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "streetAddress" TEXT;
