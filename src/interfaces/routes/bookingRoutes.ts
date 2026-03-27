import { Router } from "express";
import { BookingController } from "../controllers/BookingController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

// Guest booking (no auth needed)
router.post("/guest", BookingController.createGuestBooking);

// Authenticated user bookings
router.post("/", authenticate, BookingController.create);
router.get("/my", authenticate, BookingController.getUserBookings);

// Admin routes
router.get("/", authenticate, authorize("ADMIN"), BookingController.getAll);

export default router;
