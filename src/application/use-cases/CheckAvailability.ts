import { IBookingRepository } from "../../domain/repositories/IBookingRepository";
import { ISpaceRepository } from "../../domain/repositories/ISpaceRepository";
import { logger } from "../../infrastructure/logging/logger";

interface AvailabilityRequest {
  spaceId: string;
  date: Date;
  startTime: string;
  endTime: string;
}

interface AvailabilityResponse {
  available: boolean;
  spaceId: string;
  date: string;
  requestedSlot: { startTime: string; endTime: string };
  conflictingSlots: { startTime: string; endTime: string }[];
}

export class CheckAvailability {
  constructor(
    private bookingRepository: IBookingRepository,
    private spaceRepository: ISpaceRepository
  ) {}

  async execute(data: AvailabilityRequest): Promise<AvailabilityResponse> {
    logger.info(
      `Checking availability for space ${data.spaceId} on ${data.date}`
    );

    const space = await this.spaceRepository.findById(data.spaceId);
    if (!space) {
      throw new Error("Space not found");
    }

    if (!space.isAvailable) {
      return {
        available: false,
        spaceId: data.spaceId,
        date: data.date.toISOString().split("T")[0],
        requestedSlot: { startTime: data.startTime, endTime: data.endTime },
        conflictingSlots: [],
      };
    }

    const existingBookings = await this.bookingRepository.findBySpaceAndDate(
      data.spaceId,
      data.date
    );

    const conflictingSlots = existingBookings
      .filter((booking) =>
        this.timesOverlap(
          data.startTime,
          data.endTime,
          booking.startTime,
          booking.endTime
        )
      )
      .map((booking) => ({
        startTime: booking.startTime,
        endTime: booking.endTime,
      }));

    const available = conflictingSlots.length === 0;

    logger.info(
      `Space ${data.spaceId} is ${available ? "available" : "not available"} for requested slot`
    );

    return {
      available,
      spaceId: data.spaceId,
      date: data.date.toISOString().split("T")[0],
      requestedSlot: { startTime: data.startTime, endTime: data.endTime },
      conflictingSlots,
    };
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
}
