-- AlterTable
ALTER TABLE "courses" DROP COLUMN "exercise",
DROP COLUMN "teacher_name",
ADD COLUMN "teacher" VARCHAR(100) NOT NULL DEFAULT 'MatureX';
