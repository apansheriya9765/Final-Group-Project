import { IBookingRepository } from "../../domain/repositories/IBookingRepository";
import { Booking } from "../../domain/entities/Booking";
import { logger } from "../../infrastructure/logging/logger";

export class GetBookings {
  constructor(private bookingRepository: IBookingRepository) {}

  async executeByUser(userId: string): Promise<Booking[]> {
    logger.info(`Fetching bookings for user: ${userId}`);
    return this.bookingRepository.findByUserId(userId);
  }

  async executeAll(): Promise<Booking[]> {
    logger.info("Fetching all bookings (admin)");
    return this.bookingRepository.findAll();
  }
}
