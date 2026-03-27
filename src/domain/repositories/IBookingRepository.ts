import { Booking, CreateBookingDTO } from "../entities/Booking";

export interface IBookingRepository {
  findById(id: string): Promise<Booking | null>;
  findByUserId(userId: string): Promise<Booking[]>;
  findBySpaceAndDate(spaceId: string, date: Date): Promise<Booking[]>;
  create(data: CreateBookingDTO & { totalPrice: number }): Promise<Booking>;
  updateStatus(id: string, status: string): Promise<Booking>;
  findAll(): Promise<Booking[]>;
}
