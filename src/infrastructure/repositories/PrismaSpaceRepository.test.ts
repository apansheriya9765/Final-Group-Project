import { SpaceType } from "../../domain/entities/Space";

jest.mock("../../infrastructure/logging/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

const mockFindUnique = jest.fn();
const mockFindMany = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock("../database/prismaClient", () => ({
  __esModule: true,
  default: {
    space: {
      findUnique: (...args: any[]) => mockFindUnique(...args),
      findMany: (...args: any[]) => mockFindMany(...args),
      create: (...args: any[]) => mockCreate(...args),
      update: (...args: any[]) => mockUpdate(...args),
      delete: (...args: any[]) => mockDelete(...args),
    },
  },
}));

import { PrismaSpaceRepository } from "./PrismaSpaceRepository";

describe("PrismaSpaceRepository", () => {
  let repo: PrismaSpaceRepository;

  const prismaSpace = {
    id: "s-1",
    name: "Desk A1",
    type: "DESK" as any,
    capacity: 1,
    pricePerHour: 10,
    amenities: ["WiFi"],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new PrismaSpaceRepository();
  });

  it("findById returns mapped space", async () => {
    mockFindUnique.mockResolvedValue(prismaSpace);
    const result = await repo.findById("s-1");
    expect(result).toEqual({ ...prismaSpace, type: SpaceType.DESK });
  });

  it("findById returns null when not found", async () => {
    mockFindUnique.mockResolvedValue(null);
    expect(await repo.findById("x")).toBeNull();
  });

  it("findAll returns mapped spaces", async () => {
    mockFindMany.mockResolvedValue([prismaSpace]);
    const result = await repo.findAll();
    expect(result[0].type).toBe(SpaceType.DESK);
  });

  it("findByType passes type filter", async () => {
    mockFindMany.mockResolvedValue([]);
    await repo.findByType(SpaceType.DESK);
    expect(mockFindMany).toHaveBeenCalledWith({ where: { type: SpaceType.DESK } });
  });

  it("findAvailable filters by isAvailable", async () => {
    mockFindMany.mockResolvedValue([prismaSpace]);
    const result = await repo.findAvailable();
    expect(mockFindMany).toHaveBeenCalledWith({ where: { isAvailable: true } });
    expect(result[0].type).toBe(SpaceType.DESK);
  });

  it("create returns mapped space", async () => {
    mockCreate.mockResolvedValue(prismaSpace);
    const result = await repo.create({ name: "Desk A1", type: SpaceType.DESK, capacity: 1, pricePerHour: 10, amenities: ["WiFi"] });
    expect(result.type).toBe(SpaceType.DESK);
  });

  it("update returns mapped space", async () => {
    mockUpdate.mockResolvedValue({ ...prismaSpace, name: "Updated" });
    const result = await repo.update("s-1", { name: "Updated" });
    expect(result.name).toBe("Updated");
    expect(result.type).toBe(SpaceType.DESK);
  });

  it("delete calls prisma delete", async () => {
    mockDelete.mockResolvedValue(prismaSpace);
    await repo.delete("s-1");
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "s-1" } });
  });
});
