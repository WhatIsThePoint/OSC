import { prisma } from "../lib/prisma.js";

interface RuleInput {
  dayOfWeek: number;
  startTime: string; // "08:00"
  endTime: string; // "22:00"
}

async function assertOwner(venueId: string, ownerId: string) {
  const venue = await prisma.venue.findUnique({ where: { id: venueId } });
  if (!venue) throw { status: 404, message: "Venue not found" };
  if (venue.ownerId !== ownerId) throw { status: 403, message: "Forbidden" };
  return venue;
}

export class AvailabilityService {
  static async setRules(venueId: string, ownerId: string, rules: RuleInput[]) {
    await assertOwner(venueId, ownerId);
    // Replace existing rules so re-submitting the same set is idempotent.
    await prisma.$transaction([
      prisma.availabilityRule.deleteMany({ where: { venueId } }),
      prisma.availabilityRule.createMany({
        data: rules.map((r) => ({ ...r, venueId })),
      }),
    ]);
    return this.getRules(venueId);
  }

  static async getRules(venueId: string) {
    return prisma.availabilityRule.findMany({
      where: { venueId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
  }

  static async getSlotsForWeek(venueId: string) {
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() + 7);
    return prisma.timeSlot.findMany({
      where: { venueId, startTime: { gte: now, lt: weekEnd } },
      orderBy: { startTime: "asc" },
      select: { id: true, startTime: true, endTime: true, status: true },
    });
  }

  static async generateSlotsForUpcomingWeek(venueId: string, ownerId: string) {
    await assertOwner(venueId, ownerId);
    const rules = await this.getRules(venueId);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const slots: { venueId: string; startTime: Date; endTime: Date }[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dow = date.getDay(); // 0-6

      for (const rule of rules.filter((r) => r.dayOfWeek === dow)) {
        const startHour = parseInt(rule.startTime.split(":")[0], 10);
        const endHour = parseInt(rule.endTime.split(":")[0], 10);

        for (let h = startHour; h < endHour; h++) {
          const startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, 0, 0, 0);
          const endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h + 1, 0, 0, 0);
          if (startTime < now) continue; // skip past slots
          slots.push({ venueId, startTime, endTime });
        }
      }
    }

    // @@unique([venueId, startTime]) + skipDuplicates makes re-generation a no-op.
    const result = await prisma.timeSlot.createMany({ data: slots, skipDuplicates: true });
    return { created: result.count };
  }
}
