import { prisma } from "../lib/prisma.js";

interface VenueInput {
  name: string;
  address: string;
  sportTypes: string[];
  pricePerHour: number;
  capacity: number;
}

interface VenueFilters {
  sport?: string;
  maxPrice?: number;
  openToday?: boolean;
  openThisWeek?: boolean;
}

export class VenueService {
  static async createVenue(data: VenueInput, ownerId: string) {
    return prisma.venue.create({ data: { ...data, ownerId } });
  }

  static async listVenues(filters: VenueFilters = {}) {
    const now = new Date();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + 7);

    // openToday is the tighter window, so it takes precedence when both are set.
    const slotWindowEnd = filters.openToday ? endOfToday : filters.openThisWeek ? endOfWeek : null;

    return prisma.venue.findMany({
      where: {
        ...(filters.sport ? { sportTypes: { has: filters.sport } } : {}),
        ...(filters.maxPrice != null ? { pricePerHour: { lte: filters.maxPrice } } : {}),
        ...(slotWindowEnd
          ? {
              slots: {
                some: { status: "AVAILABLE", startTime: { gt: now, lt: slotWindowEnd } },
              },
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getVenue(id: string) {
    const venue = await prisma.venue.findUnique({ where: { id } });
    if (!venue) throw { status: 404, message: "Venue not found" };
    return venue;
  }

  static async updateVenue(id: string, data: Partial<VenueInput>, userId: string) {
    const venue = await this.getVenue(id);
    if (venue.ownerId !== userId) throw { status: 403, message: "Forbidden" };
    return prisma.venue.update({ where: { id }, data });
  }

  static async deleteVenue(id: string, userId: string) {
    const venue = await this.getVenue(id);
    if (venue.ownerId !== userId) throw { status: 403, message: "Forbidden" };
    await prisma.venue.delete({ where: { id } });
    return { message: "Venue deleted" };
  }
}
