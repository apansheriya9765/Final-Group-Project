import { GetBookings } from "./GetBookings";
import { IBookingRepository } from "../../domain/repositories/IBookingRepository";
import { Booking, BookingStatus } from "../../domain/entities/Booking";

jest.mock("../../infrastructure/logging/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("GetBookings", () => {
  let getBookings: GetBookings;
  let mockBookingRepository: jest.Mocked<IBookingRepository>;

  const mockBookings: Booking[] = [
    {
      id: "booking-1",
      userId: "user-1",
      guestEmail: null,
      guestName: null,
      spaceId: "space-1",
      date: new Date("2025-01-15"),
      startTime: "09:00",
      endTime: "11:00",
      status: BookingStatus.CONFIRMED,
      totalPrice: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    mockBookingRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findBySpaceAndDate: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
      findAll: jest.fn(),
    };
    getBookings = new GetBookings(mockBookingRepository);
  });

  it("should return bookings for a specific user", async () => {
    mockBookingRepository.findByUserId.mockResolvedValue(mockBookings);

    const result = await getBookings.executeByUser("user-1");

    expect(result).toEqual(mockBookings);
    expect(mockBookingRepository.findByUserId).toHaveBeenCalledWith("user-1");
  });

  it("should return all bookings for admin", async () => {
    mockBookingRepository.findAll.mockResolvedValue(mockBookings);

    const result = await getBookings.executeAll();

    expect(result).toEqual(mockBookings);
    expect(mockBookingRepository.findAll).toHaveBeenCalled();
  });

  it("should return empty array when user has no bookings", async () => {
    mockBookingRepository.findByUserId.mockResolvedValue([]);

    const result = await getBookings.executeByUser("user-no-bookings");

    expect(result).toEqual([]);
  });
});
