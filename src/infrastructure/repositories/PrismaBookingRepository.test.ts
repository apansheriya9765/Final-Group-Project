import { BookingStatus } from "../../domain/entities/Booking";

jest.mock("../../infrastructure/logging/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

const mockFindUnique = jest.fn();
const mockFindMany = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();

jest.mock("../database/prismaClient", () => ({
  __esModule: true,
  default: {
    booking: {
      findUnique: (...args: any[]) => mockFindUnique(...args),
      findMany: (...args: any[]) => mockFindMany(...args),
      create: (...args: any[]) => mockCreate(...args),
      update: (...args: any[]) => mockUpdate(...args),
    },
  },
}));

import { PrismaBookingRepository } from "./PrismaBookingRepository";

describe("PrismaBookingRepository", () => {
  let repo: PrismaBookingRepository;

  const prismaBooking = {
    id: "b-1",
    userId: "u-1",
    guestEmail: null,
    guestName: null,
    spaceId: "s-1",
    date: new Date("2026-05-01"),
    startTime: "09:00",
    endTime: "10:00",
    status: "PENDING" as any,
    totalPrice: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    space: { id: "s-1", name: "Desk A1", type: "DESK" },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new PrismaBookingRepository();
  });

  it("findById returns mapped booking", async () => {
    mockFindUnique.mockResolvedValue(prismaBooking);
    const result = await repo.findById("b-1");
    expect(result!.status).toBe(BookingStatus.PENDING);
  });

  it("findById returns null when not found", async () => {
    mockFindUnique.mockResolvedValue(null);
    expect(await repo.findById("x")).toBeNull();
  });

  it("findByUserId returns mapped bookings", async () => {
    mockFindMany.mockResolvedValue([prismaBooking]);
    const result = await repo.findByUserId("u-1");
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe(BookingStatus.PENDING);
  });

  it("findBySpaceAndDate filters by date range and status", async () => {
    mockFindMany.mockResolvedValue([prismaBooking]);
    const result = await repo.findBySpaceAndDate("s-1", new Date("2026-05-01"));
    expect(result[0].status).toBe(BookingStatus.PENDING);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          spaceId: "s-1",
          status: { in: ["PENDING", "CONFIRMED"] },
        }),
      })
    );
  });

  it("create returns mapped booking", async () => {
    mockCreate.mockResolvedValue(prismaBooking);
    const result = await repo.create({
      userId: "u-1",
      spaceId: "s-1",
      date: new Date("2026-05-01"),
      startTime: "09:00",
      endTime: "10:00",
      totalPrice: 10,
    });
    expect(result.status).toBe(BookingStatus.PENDING);
  });

  it("updateStatus returns mapped booking", async () => {
    const updated = { ...prismaBooking, status: "CONFIRMED" };
    mockUpdate.mockResolvedValue(updated);
    const result = await repo.updateStatus("b-1", "CONFIRMED");
    expect(result.status).toBe(BookingStatus.CONFIRMED);
  });

  it("findAll returns mapped bookings with user relation", async () => {
    mockFindMany.mockResolvedValue([{ ...prismaBooking, user: { id: "u-1", name: "Test" } }]);
    const result = await repo.findAll();
    expect(result).toHaveLength(1);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: { space: true, user: true },
        orderBy: { createdAt: "desc" },
      })
    );
  });
});
