import { LoginUser } from "./LoginUser";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User, UserRole } from "../../domain/entities/User";

jest.mock("../../infrastructure/logging/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mock-jwt-token"),
}));

import bcrypt from "bcrypt";

describe("LoginUser", () => {
  let loginUser: LoginUser;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  const mockUser: User = {
    id: "user-123",
    email: "test@example.com",
    password: "hashed_password",
    name: "Test User",
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
    };
    loginUser = new LoginUser(mockUserRepository);
  });

  it("should login successfully with valid credentials", async () => {
    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await loginUser.execute({
      email: "test@example.com",
      password: "password123",
    });

    expect(result.token).toBe("mock-jwt-token");
    expect(result.user.email).toBe(mockUser.email);
    expect(result.user.name).toBe(mockUser.name);
  });

  it("should throw error for non-existent user", async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(
      loginUser.execute({ email: "wrong@example.com", password: "pass" })
    ).rejects.toThrow("Invalid email or password");
  });

  it("should throw error for invalid password", async () => {
    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      loginUser.execute({ email: "test@example.com", password: "wrongpass" })
    ).rejects.toThrow("Invalid email or password");
  });
});
