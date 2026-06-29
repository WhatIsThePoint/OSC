-- Drop the unused role concept; ownership (Venue.ownerId) is the only authz signal.
ALTER TABLE "User" DROP COLUMN "role";
DROP TYPE "Role";
