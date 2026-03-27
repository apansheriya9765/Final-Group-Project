import { IBookingRepository } from "../../domain/repositories/IBookingRepository";
import { ISpaceRepository } from "../../domain/repositories/ISpaceRepository";
import { Booking, CreateBookingDTO } from "../../domain/entities/Booking";
import { logger } from "../../infrastructure/logging/logger";

export class CreateBooking {
  constructor(
    private bookingRepository: IBookingRepository,
    private spaceRepository: ISpaceRepository
  ) {}

  async execute(data: CreateBookingDTO): Promise<Booking> {
    logger.info(`Creating booking for space: ${data.spaceId}`);

    // Verify space exists
    const space = await this.spaceRepository.findById(data.spaceId);
    if (!space) {
      throw new Error("Space not found");
    }

    if (!space.isAvailable) {
      throw new Error("Space is not available");
    }

    // Check for time conflicts on the same date
    const existingBookings = await this.bookingRepository.findBySpaceAndDate(
      data.spaceId,
      data.date
    );

    const hasConflict = existingBookings.some((booking) => {
      return this.timesOverlap(
        data.startTime,
        data.endTime,
        booking.startTime,
        booking.endTime
      );
    });

    if (hasConflict) {
      logger.warn(
        `Booking conflict detected for space ${data.spaceId} on ${data.date}`
      );
      throw new Error(
        "Time slot is already booked. Please choose a different time."
      );
    }

    // Calculate total price
    const hours = this.calculateHours(data.startTime, data.endTime);
    const totalPrice = hours * space.pricePerHour;

    // Validate guest booking has required fields
    if (!data.userId && (!data.guestEmail || !data.guestName)) {
      throw new Error(
        "Guest bookings require both guest email and guest name"
      );
    }

    const booking = await this.bookingRepository.create({
      ...data,
      totalPrice,
    });

    logger.info(`Booking created successfully: ${booking.id}`);
    return booking;
  }

  private timesOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean {
    const toMinutes = (time: string): number => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const s1 = toMinutes(start1);
    const e1 = toMinutes(end1);
    const s2 = toMinutes(start2);
    const e2 = toMinutes(end2);

    return s1 < e2 && s2 < e1;
  }

  private calculateHours(startTime: string, endTime: string): number {
    const toMinutes = (time: string): number => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const diffMinutes = toMinutes(endTime) - toMinutes(startTime);
    return diffMinutes / 60;
  }
}
