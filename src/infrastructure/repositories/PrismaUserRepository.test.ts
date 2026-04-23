import { UserRole } from "../../domain/entities/User";

jest.mock("../../infrastructure/logging/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

const mockFindUnique = jest.fn();
const mockFindMany = jest.fn();
const mockCreate = jest.fn();

jest.mock("../database/prismaClient", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: (...args: any[]) => mockFindUnique(...args),
      findMany: (...args: any[]) => mockFindMany(...args),
      create: (...args: any[]) => mockCreate(...args),
    },
  },
}));

import { PrismaUserRepository } from "./PrismaUserRepository";

describe("PrismaUserRepository", () => {
  let repo: PrismaUserRepository;

  const prismaUser = {
    id: "u-1",
    email: "test@example.com",
    password: "hashed",
    name: "Test",
    role: "USER" as any,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new PrismaUserRepository();
  });

  describe("findById", () => {
    it("should return a user mapped to domain", async () => {
      mockFindUnique.mockResolvedValue(prismaUser);
      const result = await repo.findById("u-1");
      expect(result).toEqual({ ...prismaUser, role: UserRole.USER });
      expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: "u-1" } });
    });

    it("should return null when not found", async () => {
      mockFindUnique.mockResolvedValue(null);
      const result = await repo.findById("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("findByEmail", () => {
    it("should return a user by email", async () => {
      mockFindUnique.mockResolvedValue(prismaUser);
      const result = await repo.findByEmail("test@example.com");
      expect(result).toEqual({ ...prismaUser, role: UserRole.USER });
    });

    it("should return null when not found", async () => {
      mockFindUnique.mockResolvedValue(null);
      const result = await repo.findByEmail("missing@example.com");
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create and return a user", async () => {
      mockCreate.mockResolvedValue(prismaUser);
      const result = await repo.create({ email: "test@example.com", password: "hashed", name: "Test" });
      expect(result).toEqual({ ...prismaUser, role: UserRole.USER });
    });
  });

  describe("findAll", () => {
    it("should return all users", async () => {
      mockFindMany.mockResolvedValue([prismaUser]);
      const result = await repo.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe(UserRole.USER);
    });
  });
});
