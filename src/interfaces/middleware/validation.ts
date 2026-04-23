import { z } from "zod";
import { SpaceType } from "../../domain/entities/Space";

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const createSpaceSchema = z.object({
  name: z.string().min(1, "Space name is required"),
  type: z.nativeEnum(SpaceType),
  capacity: z.number().int().positive("Capacity must be a positive integer"),
  pricePerHour: z.number().positive("Price must be positive"),
  amenities: z.array(z.string()).default([]),
});

export const updateSpaceSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.nativeEnum(SpaceType).optional(),
  capacity: z.number().int().positive().optional(),
  pricePerHour: z.number().positive().optional(),
  amenities: z.array(z.string()).optional(),
  isAvailable: z.boolean().optional(),
});

export const createBookingSchema = z.object({
  spaceId: z.string().uuid("Invalid space ID"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:MM format"),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:MM format"),
  guestEmail: z.string().email().optional(),
  guestName: z.string().min(2).optional(),
});
