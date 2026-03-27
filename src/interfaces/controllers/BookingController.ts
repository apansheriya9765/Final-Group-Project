import { Request, Response } from "express";
import { CreateBooking } from "../../application/use-cases/CreateBooking";
import { GetBookings } from "../../application/use-cases/GetBookings";
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
}
