import { prisma } from "../lib/prisma.js";

const HOLD_DURATION_MS = 2 * 60 * 1000; // 2 minutes

export class BookingService {
  /**
   * Move an AVAILABLE slot to HELD for `userId`. A HELD slot whose
   * heldExpiresAt has passed is treated as reclaimable (the previous hold
   * lapsed) — this keeps abandoned holds from locking a slot forever before
   * the Phase 7 sweep cron exists.
   */
  static async holdSlot(slotId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const slot = await tx.timeSlot.findUnique({ where: { id: slotId } });
      if (!slot) throw { status: 404, message: "Slot not found" };

      const now = new Date();
      const lapsedHold =
        slot.status === "HELD" && slot.heldExpiresAt != null && slot.heldExpiresAt < now;

      if (slot.status !== "AVAILABLE" && !lapsedHold)
        throw { status: 409, message: "Slot not available" };

      return tx.timeSlot.update({
        where: { id: slotId },
        data: {
          status: "HELD",
          heldById: userId,
          heldExpiresAt: new Date(now.getTime() + HOLD_DURATION_MS),
        },
      });
    });
  }

  /**
   * Convert this user's live hold into a booking: HELD -> BOOKED plus a
   * CONFIRMED Reservation with a single Participant at 100%. (Acceptance
   * gating and wallet deduction arrive in Phases 6/7.)
   */
  static async confirmBooking(slotId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const slot = await tx.timeSlot.findUnique({ where: { id: slotId } });
      if (!slot) throw { status: 404, message: "Slot not found" };

      const now = new Date();
      const heldByMe =
        slot.status === "HELD" &&
        slot.heldById === userId &&
        slot.heldExpiresAt != null &&
        slot.heldExpiresAt > now;
      if (!heldByMe) throw { status: 409, message: "Hold expired or not yours" };

      const reservation = await tx.reservation.create({
        data: {
          venueId: slot.venueId,
          slotId: slot.id,
          status: "CONFIRMED",
          participants: { create: { userId, sharePercentage: 100, hasAccepted: true } },
        },
        include: { participants: true },
      });

      await tx.timeSlot.update({
        where: { id: slot.id },
        data: { status: "BOOKED", heldById: null, heldExpiresAt: null },
      });

      return reservation;
    });
  }

  /**
   * Cancel this user's own hold before confirming: HELD -> AVAILABLE.
   */
  static async releaseHold(slotId: string, userId: string) {
    const slot = await prisma.timeSlot.findUnique({ where: { id: slotId } });
    if (!slot) throw { status: 404, message: "Slot not found" };
    if (slot.status !== "HELD" || slot.heldById !== userId)
      throw { status: 409, message: "No active hold to release" };

    return prisma.timeSlot.update({
      where: { id: slotId },
      data: { status: "AVAILABLE", heldById: null, heldExpiresAt: null },
    });
  }
}
