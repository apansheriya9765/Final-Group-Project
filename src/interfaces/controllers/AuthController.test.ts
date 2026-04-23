import { Request, Response } from "express";
import { AuthController } from "./AuthController";

jest.mock("../../infrastructure/logging/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

jest.mock("../../infrastructure/repositories/PrismaUserRepository");

jest.mock("../../application/use-cases/RegisterUser", () => ({
  RegisterUser: jest.fn().mockImplementation(() => ({
    execute: mockRegisterExecute,
  })),
}));

jest.mock("../../application/use-cases/LoginUser", () => ({
  LoginUser: jest.fn().mockImplementation(() => ({
    execute: mockLoginExecute,
  })),
}));

const mockRegisterExecute = jest.fn();
const mockLoginExecute = jest.fn();

describe("AuthController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("register", () => {
    it("should register a user and return 201", async () => {
      req.body = { email: "test@example.com", password: "password123", name: "Test User" };
      const userResponse = { id: "1", email: "test@example.com", name: "Test User", role: "USER", createdAt: new Date() };
      mockRegisterExecute.mockResolvedValue(userResponse);

      await AuthController.register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: "User registered successfully", user: userResponse });
    });

    it("should return 400 for invalid input (ZodError)", async () => {
      req.body = { email: "invalid", password: "12", name: "" };

      await AuthController.register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Validation failed" }));
    });

    it("should return 409 for duplicate email", async () => {
      req.body = { email: "dup@example.com", password: "password123", name: "Test User" };
      mockRegisterExecute.mockRejectedValue(new Error("User with this email already exists"));

      await AuthController.register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: "User with this email already exists" });
    });

    it("should return 500 for unexpected errors", async () => {
      req.body = { email: "test@example.com", password: "password123", name: "Test User" };
      mockRegisterExecute.mockRejectedValue(new Error("DB connection failed"));

      await AuthController.register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });

  describe("login", () => {
    it("should login and return 200 with token", async () => {
      req.body = { email: "test@example.com", password: "password123" };
      const result = { token: "jwt-token", user: { id: "1", email: "test@example.com" } };
      mockLoginExecute.mockResolvedValue(result);

      await AuthController.login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Login successful", ...result });
    });

    it("should return 400 for invalid input (ZodError)", async () => {
      req.body = { email: "invalid", password: "" };

      await AuthController.login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 401 for invalid credentials", async () => {
      req.body = { email: "test@example.com", password: "wrong" };
      mockLoginExecute.mockRejectedValue(new Error("Invalid email or password"));

      await AuthController.login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid email or password" });
    });

    it("should return 500 for unexpected errors", async () => {
      req.body = { email: "test@example.com", password: "password123" };
      mockLoginExecute.mockRejectedValue(new Error("Something broke"));

      await AuthController.login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
