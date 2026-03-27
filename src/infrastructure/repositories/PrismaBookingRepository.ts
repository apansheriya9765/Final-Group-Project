import prisma from "../database/prismaClient";
import { IBookingRepository } from "../../domain/repositories/IBookingRepository";
import { Booking, CreateBookingDTO } from "../../domain/entities/Booking";

export class PrismaBookingRepository implements IBookingRepository {
  async findById(id: string): Promise<Booking | null> {
    return prisma.booking.findUnique({
      where: { id },
      include: { space: true },
    });
  }

  async findByUserId(userId: string): Promise<Booking[]> {
    return prisma.booking.findMany({
      where: { userId },
      include: { space: true },
      orderBy: { date: "desc" },
    });
  }

  async findBySpaceAndDate(spaceId: string, date: Date): Promise<Booking[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.booking.findMany({
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
  }

  async create(
    data: CreateBookingDTO & { totalPrice: number }
  ): Promise<Booking> {
    return prisma.booking.create({
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
  }

  async updateStatus(id: string, status: string): Promise<Booking> {
    return prisma.booking.update({
      where: { id },
      data: { status: status as any },
      include: { space: true },
    });
  }

  async findAll(): Promise<Booking[]> {
    return prisma.booking.findMany({
      include: { space: true, user: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
