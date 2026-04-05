import { CancelBooking } from "./CancelBooking";
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

describe("CancelBooking", () => {
  let cancelBooking: CancelBooking;
  let mockBookingRepository: jest.Mocked<IBookingRepository>;

  const mockBooking: Booking = {
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
    cancelBooking = new CancelBooking(mockBookingRepository);
  });

  it("should cancel a booking successfully", async () => {
    mockBookingRepository.findById.mockResolvedValue(mockBooking);
    mockBookingRepository.updateStatus.mockResolvedValue({
      ...mockBooking,
      status: BookingStatus.CANCELLED,
    });

    const result = await cancelBooking.execute("booking-1", "user-1");

    expect(result.status).toBe(BookingStatus.CANCELLED);
    expect(mockBookingRepository.updateStatus).toHaveBeenCalledWith(
      "booking-1",
      BookingStatus.CANCELLED
    );
  });

  it("should throw error if booking not found", async () => {
    mockBookingRepository.findById.mockResolvedValue(null);

    await expect(
      cancelBooking.execute("nonexistent", "user-1")
    ).rejects.toThrow("Booking not found");
  });

  it("should throw error if user tries to cancel another user's booking", async () => {
    mockBookingRepository.findById.mockResolvedValue(mockBooking);

    await expect(
      cancelBooking.execute("booking-1", "different-user")
    ).rejects.toThrow("You can only cancel your own bookings");
  });

  it("should throw error if booking is already cancelled", async () => {
    mockBookingRepository.findById.mockResolvedValue({
      ...mockBooking,
      status: BookingStatus.CANCELLED,
    });

    await expect(
      cancelBooking.execute("booking-1", "user-1")
    ).rejects.toThrow("Booking is already cancelled");
  });

  it("should throw error if booking is declined", async () => {
    mockBookingRepository.findById.mockResolvedValue({
      ...mockBooking,
      status: BookingStatus.DECLINED,
    });

    await expect(
      cancelBooking.execute("booking-1", "user-1")
    ).rejects.toThrow("Cannot cancel a declined booking");
  });
});
