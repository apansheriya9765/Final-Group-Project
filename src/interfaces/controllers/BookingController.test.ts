import { Request, Response } from "express";
import { BookingController } from "./BookingController";
import { AuthRequest } from "../middleware/authMiddleware";

jest.mock("../../infrastructure/logging/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

jest.mock("../../infrastructure/repositories/PrismaBookingRepository");
jest.mock("../../infrastructure/repositories/PrismaSpaceRepository");

const mockCreateBookingExecute = jest.fn();
const mockGetBookingsExecuteByUser = jest.fn();
const mockGetBookingsExecuteAll = jest.fn();
const mockCancelBookingExecute = jest.fn();
const mockCheckAvailabilityExecute = jest.fn();
const mockAdminConfirm = jest.fn();
const mockAdminDecline = jest.fn();

jest.mock("../../application/use-cases/CreateBooking", () => ({
  CreateBooking: jest.fn().mockImplementation(() => ({ execute: mockCreateBookingExecute })),
}));
jest.mock("../../application/use-cases/GetBookings", () => ({
  GetBookings: jest.fn().mockImplementation(() => ({
    executeByUser: mockGetBookingsExecuteByUser,
    executeAll: mockGetBookingsExecuteAll,
  })),
}));
jest.mock("../../application/use-cases/CancelBooking", () => ({
  CancelBooking: jest.fn().mockImplementation(() => ({ execute: mockCancelBookingExecute })),
}));
jest.mock("../../application/use-cases/CheckAvailability", () => ({
  CheckAvailability: jest.fn().mockImplementation(() => ({ execute: mockCheckAvailabilityExecute })),
}));
jest.mock("../../application/use-cases/AdminManageBooking", () => ({
  AdminManageBooking: jest.fn().mockImplementation(() => ({
    confirm: mockAdminConfirm,
    decline: mockAdminDecline,
  })),
}));

describe("BookingController", () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
      params: {},
      query: {},
      user: { userId: "user-1", email: "test@example.com", role: "USER" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("create", () => {
    const validBody = {
      spaceId: "550e8400-e29b-41d4-a716-446655440000",
      date: "2026-05-01",
      startTime: "09:00",
      endTime: "10:00",
    };

    it("should create a booking and return 201", async () => {
      req.body = validBody;
      const booking = { id: "b-1", ...validBody, status: "PENDING" };
      mockCreateBookingExecute.mockResolvedValue(booking);

      await BookingController.create(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: "Booking created successfully", booking });
    });

    it("should return 400 for validation errors", async () => {
      req.body = { spaceId: "invalid" };

      await BookingController.create(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 if space not found/available", async () => {
      req.body = validBody;
      mockCreateBookingExecute.mockRejectedValue(new Error("Space not found"));

      await BookingController.create(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 409 if time slot already booked", async () => {
      req.body = validBody;
      mockCreateBookingExecute.mockRejectedValue(new Error("Time slot is already booked"));

      await BookingController.create(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(409);
    });

    it("should return 500 for unexpected errors", async () => {
      req.body = validBody;
      mockCreateBookingExecute.mockRejectedValue(new Error("DB error"));

      await BookingController.create(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("createGuestBooking", () => {
    const validGuestBody = {
      spaceId: "550e8400-e29b-41d4-a716-446655440000",
      date: "2026-05-01",
      startTime: "09:00",
      endTime: "10:00",
      guestEmail: "guest@example.com",
      guestName: "Guest User",
    };

    it("should create a guest booking and return 201", async () => {
      req.body = validGuestBody;
      const booking = { id: "b-1", ...validGuestBody, status: "PENDING" };
      mockCreateBookingExecute.mockResolvedValue(booking);

      await BookingController.createGuestBooking(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: "Guest booking created successfully", booking });
    });

    it("should return 400 if guest email/name missing", async () => {
      req.body = {
        spaceId: "550e8400-e29b-41d4-a716-446655440000",
        date: "2026-05-01",
        startTime: "09:00",
        endTime: "10:00",
      };

      await BookingController.createGuestBooking(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Guest email and guest name are required for guest bookings" });
    });

    it("should return 400 for validation errors", async () => {
      req.body = {};

      await BookingController.createGuestBooking(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 409 if time slot already booked", async () => {
      req.body = validGuestBody;
      mockCreateBookingExecute.mockRejectedValue(new Error("Time slot is already booked"));

      await BookingController.createGuestBooking(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(409);
    });

    it("should return 500 for unexpected errors", async () => {
      req.body = validGuestBody;
      mockCreateBookingExecute.mockRejectedValue(new Error("DB error"));

      await BookingController.createGuestBooking(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getUserBookings", () => {
    it("should return user bookings", async () => {
      const bookings = [{ id: "b-1" }];
      mockGetBookingsExecuteByUser.mockResolvedValue(bookings);

      await BookingController.getUserBookings(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ bookings });
    });

    it("should return 500 on error", async () => {
      mockGetBookingsExecuteByUser.mockRejectedValue(new Error("DB error"));

      await BookingController.getUserBookings(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getAll", () => {
    it("should return all bookings", async () => {
      const bookings = [{ id: "b-1" }, { id: "b-2" }];
      mockGetBookingsExecuteAll.mockResolvedValue(bookings);

      await BookingController.getAll(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ bookings });
    });

    it("should return 500 on error", async () => {
      mockGetBookingsExecuteAll.mockRejectedValue(new Error("DB error"));

      await BookingController.getAll(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("cancel", () => {
    it("should cancel a booking and return 200", async () => {
      req.params = { id: "b-1" };
      const booking = { id: "b-1", status: "CANCELLED" };
      mockCancelBookingExecute.mockResolvedValue(booking);

      await BookingController.cancel(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Booking cancelled successfully", booking });
    });

    it("should return 404 if booking not found", async () => {
      req.params = { id: "nonexistent" };
      mockCancelBookingExecute.mockRejectedValue(new Error("Booking not found"));

      await BookingController.cancel(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 400 for cancel-own-only error", async () => {
      req.params = { id: "b-1" };
      mockCancelBookingExecute.mockRejectedValue(new Error("You can only cancel your own bookings"));

      await BookingController.cancel(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 if already cancelled", async () => {
      req.params = { id: "b-1" };
      mockCancelBookingExecute.mockRejectedValue(new Error("Booking is already cancelled"));

      await BookingController.cancel(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 500 for unexpected errors", async () => {
      req.params = { id: "b-1" };
      mockCancelBookingExecute.mockRejectedValue(new Error("DB error"));

      await BookingController.cancel(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("checkAvailability", () => {
    it("should return availability result", async () => {
      req.query = { spaceId: "s-1", date: "2026-05-01", startTime: "09:00", endTime: "10:00" };
      const result = { isAvailable: true, conflicts: [] };
      mockCheckAvailabilityExecute.mockResolvedValue(result);

      await BookingController.checkAvailability(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it("should return 400 if query params missing", async () => {
      req.query = { spaceId: "s-1" };

      await BookingController.checkAvailability(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 if space not found", async () => {
      req.query = { spaceId: "s-1", date: "2026-05-01", startTime: "09:00", endTime: "10:00" };
      mockCheckAvailabilityExecute.mockRejectedValue(new Error("Space not found"));

      await BookingController.checkAvailability(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 500 for unexpected errors", async () => {
      req.query = { spaceId: "s-1", date: "2026-05-01", startTime: "09:00", endTime: "10:00" };
      mockCheckAvailabilityExecute.mockRejectedValue(new Error("DB error"));

      await BookingController.checkAvailability(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("confirmBooking", () => {
    it("should confirm a booking and return 200", async () => {
      req.params = { id: "b-1" };
      const booking = { id: "b-1", status: "CONFIRMED" };
      mockAdminConfirm.mockResolvedValue(booking);

      await BookingController.confirmBooking(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Booking confirmed successfully", booking });
    });

    it("should return 404 if booking not found", async () => {
      req.params = { id: "nonexistent" };
      mockAdminConfirm.mockRejectedValue(new Error("Booking not found"));

      await BookingController.confirmBooking(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 400 if cannot confirm", async () => {
      req.params = { id: "b-1" };
      mockAdminConfirm.mockRejectedValue(new Error("Cannot confirm this booking"));

      await BookingController.confirmBooking(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 500 for unexpected errors", async () => {
      req.params = { id: "b-1" };
      mockAdminConfirm.mockRejectedValue(new Error("DB error"));

      await BookingController.confirmBooking(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("declineBooking", () => {
    it("should decline a booking and return 200", async () => {
      req.params = { id: "b-1" };
      const booking = { id: "b-1", status: "DECLINED" };
      mockAdminDecline.mockResolvedValue(booking);

      await BookingController.declineBooking(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Booking declined successfully", booking });
    });

    it("should return 404 if booking not found", async () => {
      req.params = { id: "nonexistent" };
      mockAdminDecline.mockRejectedValue(new Error("Booking not found"));

      await BookingController.declineBooking(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 400 if cannot decline", async () => {
      req.params = { id: "b-1" };
      mockAdminDecline.mockRejectedValue(new Error("Cannot decline this booking"));

      await BookingController.declineBooking(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 500 for unexpected errors", async () => {
      req.params = { id: "b-1" };
      mockAdminDecline.mockRejectedValue(new Error("DB error"));

      await BookingController.declineBooking(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
