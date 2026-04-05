import { IBookingRepository } from "../../domain/repositories/IBookingRepository";
import { Booking, BookingStatus } from "../../domain/entities/Booking";
import { logger } from "../../infrastructure/logging/logger";

export class CancelBooking {
  constructor(private bookingRepository: IBookingRepository) {}

  async execute(bookingId: string, userId: string): Promise<Booking> {
    logger.info(`User ${userId} requesting cancellation for booking ${bookingId}`);

    const booking = await this.bookingRepository.findById(bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.userId !== userId) {
      throw new Error("You can only cancel your own bookings");
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new Error("Booking is already cancelled");
    }

    if (booking.status === BookingStatus.DECLINED) {
      throw new Error("Cannot cancel a declined booking");
    }

    const updatedBooking = await this.bookingRepository.updateStatus(
      bookingId,
      BookingStatus.CANCELLED
    );

    logger.info(`Booking ${bookingId} cancelled successfully by user ${userId}`);
    return updatedBooking;
  }
}
