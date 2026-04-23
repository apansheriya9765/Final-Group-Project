import prisma from "../database/prismaClient";
import { IBookingRepository } from "../../domain/repositories/IBookingRepository";
import { Booking, CreateBookingDTO, BookingStatus } from "../../domain/entities/Booking";

function toDomain(booking: Record<string, any>): Booking {
  return { ...booking, status: booking.status as BookingStatus } as Booking;
}

export class PrismaBookingRepository implements IBookingRepository {
  async findById(id: string): Promise<Booking | null> {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { space: true },
    });
    return booking ? toDomain(booking) : null;
  }

  async findByUserId(userId: string): Promise<Booking[]> {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: { space: true },
      orderBy: { date: "desc" },
    });
    return bookings.map(toDomain);
  }

  async findBySpaceAndDate(spaceId: string, date: Date): Promise<Booking[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await prisma.booking.findMany({
      where: {
        spaceId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });
    return bookings.map(toDomain);
  }

  async create(
    data: CreateBookingDTO & { totalPrice: number }
  ): Promise<Booking> {
    const booking = await prisma.booking.create({
      data: {
        userId: data.userId,
        guestEmail: data.guestEmail,
        guestName: data.guestName,
        spaceId: data.spaceId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        totalPrice: data.totalPrice,
      },
      include: { space: true },
    });
    return toDomain(booking);
  }

  async updateStatus(id: string, status: string): Promise<Booking> {
    const booking = await prisma.booking.update({
      where: { id },
      data: { status: status as any },
      include: { space: true },
    });
    return toDomain(booking);
  }

  async findAll(): Promise<Booking[]> {
    const bookings = await prisma.booking.findMany({
      include: { space: true, user: true },
      orderBy: { createdAt: "desc" },
    });
    return bookings.map(toDomain);
  }
}
