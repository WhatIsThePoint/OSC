import { Venue } from "@prisma/client";

// Prisma Decimal columns serialize to strings by default. Convert at the
// API boundary so clients receive numbers (e.g. pricePerHour: 40 not "40").
export function serializeVenue<T extends Venue>(venue: T) {
  return { ...venue, pricePerHour: Number(venue.pricePerHour) };
}
