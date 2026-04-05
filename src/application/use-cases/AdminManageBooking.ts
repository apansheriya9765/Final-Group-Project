import { IBookingRepository } from "../../domain/repositories/IBookingRepository";
import { Booking, BookingStatus } from "../../domain/entities/Booking";
import { logger } from "../../infrastructure/logging/logger";

export class AdminManageBooking {
  constructor(private bookingRepository: IBookingRepository) {}

  async confirm(bookingId: string): Promise<Booking> {
    logger.info(`Admin confirming booking: ${bookingId}`);

    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new Error(
        `Cannot confirm a booking with status: ${booking.status}`
      );
    }

    const updated = await this.bookingRepository.updateStatus(
      bookingId,
      BookingStatus.CONFIRMED
    );

    logger.info(`Booking ${bookingId} confirmed by admin`);
    return updated;
  }

  async decline(bookingId: string): Promise<Booking> {
    logger.info(`Admin declining booking: ${bookingId}`);

    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new Error(
        `Cannot decline a booking with status: ${booking.status}`
      );
    }

    const updated = await this.bookingRepository.updateStatus(
      bookingId,
      BookingStatus.DECLINED
    );

    logger.info(`Booking ${bookingId} declined by admin`);
    return updated;
  }
}
