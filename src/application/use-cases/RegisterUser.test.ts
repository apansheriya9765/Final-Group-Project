import { RegisterUser } from "./RegisterUser";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User, UserRole } from "../../domain/entities/User";

// Mock logger
jest.mock("../../infrastructure/logging/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock bcrypt
jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
}));

describe("RegisterUser", () => {
  let registerUser: RegisterUser;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
    };
    registerUser = new RegisterUser(mockUserRepository);
  });

  it("should register a new user successfully", async () => {
    const userData = {
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    };

    const createdUser: User = {
      id: "user-123",
      email: userData.email,
      password: "hashed_password",
      name: userData.name,
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(createdUser);

    const result = await registerUser.execute(userData);

    expect(result.email).toBe(userData.email);
    expect(result.name).toBe(userData.name);
    expect(result.role).toBe(UserRole.USER);
    expect(result).not.toHaveProperty("password");
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
    expect(mockUserRepository.create).toHaveBeenCalled();
  });

  it("should throw error if email already exists", async () => {
    const existingUser: User = {
      id: "user-123",
      email: "existing@example.com",
      password: "hashed",
      name: "Existing",
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUserRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(
      registerUser.execute({
        email: "existing@example.com",
        password: "password123",
        name: "Test",
      })
    ).rejects.toThrow("User with this email already exists");
  });
});
