import { CheckAvailability } from "./CheckAvailability";
import { IBookingRepository } from "../../domain/repositories/IBookingRepository";
import { ISpaceRepository } from "../../domain/repositories/ISpaceRepository";
import { Space, SpaceType } from "../../domain/entities/Space";
import { Booking, BookingStatus } from "../../domain/entities/Booking";

jest.mock("../../infrastructure/logging/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("CheckAvailability", () => {
  let checkAvailability: CheckAvailability;
  let mockBookingRepository: jest.Mocked<IBookingRepository>;
  let mockSpaceRepository: jest.Mocked<ISpaceRepository>;

  const mockSpace: Space = {
    id: "space-1",
    name: "Desk A1",
    type: SpaceType.DESK,
    capacity: 1,
    pricePerHour: 10,
    amenities: ["WiFi"],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockBookingRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findBySpaceAndDate: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
      findAll: jest.fn(),
    };

    mockSpaceRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByType: jest.fn(),
      findAvailable: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    checkAvailability = new CheckAvailability(
      mockBookingRepository,
      mockSpaceRepository
    );
  });

  it("should return available when no conflicting bookings", async () => {
    mockSpaceRepository.findById.mockResolvedValue(mockSpace);
    mockBookingRepository.findBySpaceAndDate.mockResolvedValue([]);

    const result = await checkAvailability.execute({
      spaceId: "space-1",
      date: new Date("2025-01-15"),
      startTime: "09:00",
      endTime: "11:00",
    });

    expect(result.available).toBe(true);
    expect(result.conflictingSlots).toHaveLength(0);
  });

  it("should return unavailable when there is a conflicting booking", async () => {
    mockSpaceRepository.findById.mockResolvedValue(mockSpace);

    const existingBooking: Booking = {
      id: "booking-1",
      userId: "user-1",
      guestEmail: null,
      guestName: null,
      spaceId: "space-1",
      date: new Date("2025-01-15"),
      startTime: "10:00",
      endTime: "12:00",
      status: BookingStatus.CONFIRMED,
      totalPrice: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockBookingRepository.findBySpaceAndDate.mockResolvedValue([existingBooking]);

    const result = await checkAvailability.execute({
      spaceId: "space-1",
      date: new Date("2025-01-15"),
      startTime: "09:00",
      endTime: "11:00",
    });

    expect(result.available).toBe(false);
    expect(result.conflictingSlots).toHaveLength(1);
    expect(result.conflictingSlots[0]).toEqual({
      startTime: "10:00",
      endTime: "12:00",
    });
  });

  it("should throw error if space not found", async () => {
    mockSpaceRepository.findById.mockResolvedValue(null);

    await expect(
      checkAvailability.execute({
        spaceId: "nonexistent",
        date: new Date("2025-01-15"),
        startTime: "09:00",
        endTime: "11:00",
      })
    ).rejects.toThrow("Space not found");
  });

  it("should return unavailable when space is marked as not available", async () => {
    mockSpaceRepository.findById.mockResolvedValue({
      ...mockSpace,
      isAvailable: false,
    });

    const result = await checkAvailability.execute({
      spaceId: "space-1",
      date: new Date("2025-01-15"),
      startTime: "09:00",
      endTime: "11:00",
    });

    expect(result.available).toBe(false);
  });
});
