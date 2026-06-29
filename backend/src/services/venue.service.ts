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
}

export class VenueService {
  static async createVenue(data: VenueInput, ownerId: string) {
    return prisma.venue.create({ data: { ...data, ownerId } });
  }

  static async listVenues(filters: VenueFilters = {}) {
    return prisma.venue.findMany({
      where: {
        ...(filters.sport ? { sportTypes: { has: filters.sport } } : {}),
        ...(filters.maxPrice != null ? { pricePerHour: { lte: filters.maxPrice } } : {}),
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
