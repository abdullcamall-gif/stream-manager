-- Normalize existing data before enum change
UPDATE "AdminUser"
SET "role" = 'ADMIN'
WHERE "role" = 'SUPER_ADMIN';

-- Recreate enum without SUPER_ADMIN
ALTER TYPE "AdminRole" RENAME TO "AdminRole_old";
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'SUPPORT');
ALTER TABLE "AdminUser"
  ALTER COLUMN "role" TYPE "AdminRole"
  USING ("role"::text::"AdminRole");
DROP TYPE "AdminRole_old";
