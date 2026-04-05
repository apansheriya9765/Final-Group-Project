import { Request, Response } from "express";
import { CreateBooking } from "../../application/use-cases/CreateBooking";
import { GetBookings } from "../../application/use-cases/GetBookings";
import { CancelBooking } from "../../application/use-cases/CancelBooking";
import { CheckAvailability } from "../../application/use-cases/CheckAvailability";
import { AdminManageBooking } from "../../application/use-cases/AdminManageBooking";
import { PrismaBookingRepository } from "../../infrastructure/repositories/PrismaBookingRepository";
import { PrismaSpaceRepository } from "../../infrastructure/repositories/PrismaSpaceRepository";
import { createBookingSchema } from "../middleware/validation";
import { AuthRequest } from "../middleware/authMiddleware";
import { logger } from "../../infrastructure/logging/logger";

const bookingRepository = new PrismaBookingRepository();
const spaceRepository = new PrismaSpaceRepository();

export class BookingController {
  // Create booking for authenticated user
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const validatedData = createBookingSchema.parse(req.body);
      const createBooking = new CreateBooking(
        bookingRepository,
        spaceRepository
      );

      const booking = await createBooking.execute({
        userId: req.user!.userId,
        spaceId: validatedData.spaceId,
        date: new Date(validatedData.date),
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
      });

      res.status(201).json({
        message: "Booking created successfully",
        booking,
      });
    } catch (error: any) {
      logger.error(`Create booking error: ${error.message}`);

      if (error.name === "ZodError") {
        res
          .status(400)
          .json({ error: "Validation failed", details: error.errors });
        return;
      }

      if (
        error.message.includes("not found") ||
        error.message.includes("not available")
      ) {
        res.status(404).json({ error: error.message });
        return;
      }

      if (error.message.includes("already booked")) {
        res.status(409).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Create booking for guest (no authentication required)
  static async createGuestBooking(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const validatedData = createBookingSchema.parse(req.body);

      if (!validatedData.guestEmail || !validatedData.guestName) {
        res.status(400).json({
          error: "Guest email and guest name are required for guest bookings",
        });
        return;
      }

      const createBooking = new CreateBooking(
        bookingRepository,
        spaceRepository
      );

      const booking = await createBooking.execute({
        guestEmail: validatedData.guestEmail,
        guestName: validatedData.guestName,
        spaceId: validatedData.spaceId,
        date: new Date(validatedData.date),
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
      });

      res.status(201).json({
        message: "Guest booking created successfully",
        booking,
      });
    } catch (error: any) {
      logger.error(`Guest booking error: ${error.message}`);

      if (error.name === "ZodError") {
        res
          .status(400)
          .json({ error: "Validation failed", details: error.errors });
        return;
      }

      if (error.message.includes("already booked")) {
        res.status(409).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get bookings for authenticated user
  static async getUserBookings(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const getBookings = new GetBookings(bookingRepository);
      const bookings = await getBookings.executeByUser(req.user!.userId);

      res.status(200).json({ bookings });
    } catch (error: any) {
      logger.error(`Get user bookings error: ${error.message}`);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get all bookings (admin)
  static async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const getBookings = new GetBookings(bookingRepository);
      const bookings = await getBookings.executeAll();

      res.status(200).json({ bookings });
    } catch (error: any) {
      logger.error(`Get all bookings error: ${error.message}`);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Cancel booking (authenticated user)
  static async cancel(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const cancelBooking = new CancelBooking(bookingRepository);
      const booking = await cancelBooking.execute(id, req.user!.userId);

      res.status(200).json({
        message: "Booking cancelled successfully",
        booking,
      });
    } catch (error: any) {
      logger.error(`Cancel booking error: ${error.message}`);

      if (error.message === "Booking not found") {
        res.status(404).json({ error: error.message });
        return;
      }

      if (
        error.message.includes("only cancel your own") ||
        error.message.includes("already cancelled") ||
        error.message.includes("Cannot cancel")
      ) {
        res.status(400).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Check space availability (public)
  static async checkAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { spaceId, date, startTime, endTime } = req.query;

      if (!spaceId || !date || !startTime || !endTime) {
        res.status(400).json({
          error: "Missing required query parameters: spaceId, date, startTime, endTime",
        });
        return;
      }

      const checkAvailability = new CheckAvailability(
        bookingRepository,
        spaceRepository
      );

      const result = await checkAvailability.execute({
        spaceId: spaceId as string,
        date: new Date(date as string),
        startTime: startTime as string,
        endTime: endTime as string,
      });

      res.status(200).json(result);
    } catch (error: any) {
      logger.error(`Check availability error: ${error.message}`);

      if (error.message === "Space not found") {
        res.status(404).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Admin confirm booking
  static async confirmBooking(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const adminManage = new AdminManageBooking(bookingRepository);
      const booking = await adminManage.confirm(id);

      res.status(200).json({
        message: "Booking confirmed successfully",
        booking,
      });
    } catch (error: any) {
      logger.error(`Admin confirm booking error: ${error.message}`);

      if (error.message === "Booking not found") {
        res.status(404).json({ error: error.message });
        return;
      }

      if (error.message.includes("Cannot confirm")) {
        res.status(400).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Admin decline booking
  static async declineBooking(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const adminManage = new AdminManageBooking(bookingRepository);
      const booking = await adminManage.decline(id);

      res.status(200).json({
        message: "Booking declined successfully",
        booking,
      });
    } catch (error: any) {
      logger.error(`Admin decline booking error: ${error.message}`);

      if (error.message === "Booking not found") {
        res.status(404).json({ error: error.message });
        return;
      }

      if (error.message.includes("Cannot decline")) {
        res.status(400).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: "Internal server error" });
    }
  }
}
