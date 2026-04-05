import { AdminManageBooking } from "./AdminManageBooking";
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

describe("AdminManageBooking", () => {
  let adminManage: AdminManageBooking;
  let mockBookingRepository: jest.Mocked<IBookingRepository>;

  const pendingBooking: Booking = {
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

  beforeEach(() => {
    mockBookingRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findBySpaceAndDate: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
      findAll: jest.fn(),
    };
    adminManage = new AdminManageBooking(mockBookingRepository);
  });

  describe("confirm", () => {
    it("should confirm a pending booking", async () => {
      mockBookingRepository.findById.mockResolvedValue(pendingBooking);
      mockBookingRepository.updateStatus.mockResolvedValue({
        ...pendingBooking,
        status: BookingStatus.CONFIRMED,
      });

      const result = await adminManage.confirm("booking-1");

      expect(result.status).toBe(BookingStatus.CONFIRMED);
      expect(mockBookingRepository.updateStatus).toHaveBeenCalledWith(
        "booking-1",
        BookingStatus.CONFIRMED
      );
    });

    it("should throw error if booking not found", async () => {
      mockBookingRepository.findById.mockResolvedValue(null);

      await expect(adminManage.confirm("nonexistent")).rejects.toThrow(
        "Booking not found"
      );
    });

    it("should throw error if booking is not pending", async () => {
      mockBookingRepository.findById.mockResolvedValue({
        ...pendingBooking,
        status: BookingStatus.CONFIRMED,
      });

      await expect(adminManage.confirm("booking-1")).rejects.toThrow(
        "Cannot confirm a booking with status: CONFIRMED"
      );
    });
  });

  describe("decline", () => {
    it("should decline a pending booking", async () => {
      mockBookingRepository.findById.mockResolvedValue(pendingBooking);
      mockBookingRepository.updateStatus.mockResolvedValue({
        ...pendingBooking,
        status: BookingStatus.DECLINED,
      });

      const result = await adminManage.decline("booking-1");

      expect(result.status).toBe(BookingStatus.DECLINED);
      expect(mockBookingRepository.updateStatus).toHaveBeenCalledWith(
        "booking-1",
        BookingStatus.DECLINED
      );
    });

    it("should throw error if booking not found", async () => {
      mockBookingRepository.findById.mockResolvedValue(null);

      await expect(adminManage.decline("nonexistent")).rejects.toThrow(
        "Booking not found"
      );
    });

    it("should throw error if booking is already cancelled", async () => {
      mockBookingRepository.findById.mockResolvedValue({
        ...pendingBooking,
        status: BookingStatus.CANCELLED,
      });

      await expect(adminManage.decline("booking-1")).rejects.toThrow(
        "Cannot decline a booking with status: CANCELLED"
      );
    });
  });
});
