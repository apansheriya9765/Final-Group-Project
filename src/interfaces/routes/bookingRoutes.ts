import { Router } from "express";
import { BookingController } from "../controllers/BookingController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

// Public routes
router.post("/guest", BookingController.createGuestBooking);
router.get("/availability", BookingController.checkAvailability);

// Authenticated user bookings
router.post("/", authenticate, BookingController.create);
router.get("/my", authenticate, BookingController.getUserBookings);
router.patch("/:id/cancel", authenticate, BookingController.cancel);

// Admin routes
router.get("/", authenticate, authorize("ADMIN"), BookingController.getAll);

export default router;
