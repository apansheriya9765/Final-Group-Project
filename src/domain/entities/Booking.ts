export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  DECLINED = "DECLINED",
  CANCELLED = "CANCELLED",
}

export interface Booking {
  id: string;
  userId?: string | null;
  guestEmail?: string | null;
  guestName?: string | null;
  spaceId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingDTO {
  userId?: string;
  guestEmail?: string;
  guestName?: string;
  spaceId: string;
  date: Date;
  startTime: string;
  endTime: string;
}
