import { CreateBooking } from "./CreateBooking";
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

describe("CreateBooking", () => {
  let createBooking: CreateBooking;
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
      delete: jest.fn(),
    };

    createBooking = new CreateBooking(mockBookingRepository, mockSpaceRepository);
  });

  it("should create a booking successfully", async () => {
    mockSpaceRepository.findById.mockResolvedValue(mockSpace);
    mockBookingRepository.findBySpaceAndDate.mockResolvedValue([]);

    const mockBooking: Booking = {
      id: "booking-1",
      userId: "user-1",
      guestEmail: null,
      guestName: null,
      spaceId: "space-1",
      date: new Date("2025-01-15"),
      startTime: "09:00",
      endTime: "11:00",
      status: BookingStatus.PENDING,
      totalPrice: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockBookingRepository.create.mockResolvedValue(mockBooking);

    const result = await createBooking.execute({
      userId: "user-1",
      spaceId: "space-1",
      date: new Date("2025-01-15"),
      startTime: "09:00",
      endTime: "11:00",
    });

    expect(result.id).toBe("booking-1");
    expect(result.totalPrice).toBe(20);
    expect(mockBookingRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        totalPrice: 20, // 2 hours * $10/hr
      })
    );
  });

  it("should throw error if space not found", async () => {
    mockSpaceRepository.findById.mockResolvedValue(null);

    await expect(
      createBooking.execute({
        userId: "user-1",
        spaceId: "nonexistent",
        date: new Date("2025-01-15"),
        startTime: "09:00",
        endTime: "11:00",
      })
    ).rejects.toThrow("Space not found");
  });

  it("should throw error if time slot conflicts", async () => {
    mockSpaceRepository.findById.mockResolvedValue(mockSpace);

    const existingBooking: Booking = {
      id: "existing-1",
      userId: "other-user",
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

    await expect(
      createBooking.execute({
        userId: "user-1",
        spaceId: "space-1",
        date: new Date("2025-01-15"),
        startTime: "09:00",
        endTime: "11:00",
      })
    ).rejects.toThrow("Time slot is already booked");
  });

  it("should throw error for guest booking without email", async () => {
    mockSpaceRepository.findById.mockResolvedValue(mockSpace);
    mockBookingRepository.findBySpaceAndDate.mockResolvedValue([]);

    await expect(
      createBooking.execute({
        spaceId: "space-1",
        date: new Date("2025-01-15"),
        startTime: "09:00",
        endTime: "11:00",
      })
    ).rejects.toThrow("Guest bookings require both guest email and guest name");
  });

  it("should allow non-overlapping bookings on same day", async () => {
    mockSpaceRepository.findById.mockResolvedValue(mockSpace);

    const existingBooking: Booking = {
      id: "existing-1",
      userId: "other-user",
      guestEmail: null,
      guestName: null,
      spaceId: "space-1",
      date: new Date("2025-01-15"),
      startTime: "09:00",
      endTime: "10:00",
      status: BookingStatus.CONFIRMED,
      totalPrice: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockBookingRepository.findBySpaceAndDate.mockResolvedValue([existingBooking]);

    const newBooking: Booking = {
      id: "booking-2",
      userId: "user-1",
      guestEmail: null,
      guestName: null,
      spaceId: "space-1",
      date: new Date("2025-01-15"),
      startTime: "10:00",
      endTime: "12:00",
      status: BookingStatus.PENDING,
      totalPrice: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockBookingRepository.create.mockResolvedValue(newBooking);

    const result = await createBooking.execute({
      userId: "user-1",
      spaceId: "space-1",
      date: new Date("2025-01-15"),
      startTime: "10:00",
      endTime: "12:00",
    });

    expect(result.id).toBe("booking-2");
  });
});
