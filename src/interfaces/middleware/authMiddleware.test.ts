import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authenticate, authorize, AuthRequest } from "./authMiddleware";

jest.mock("../../infrastructure/logging/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("authMiddleware", () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = { headers: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe("authenticate", () => {
    it("should return 401 if no authorization header", () => {
      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Authentication required",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 if authorization header does not start with Bearer", () => {
      mockReq.headers = { authorization: "Basic some-token" };

      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 for invalid token", () => {
      mockReq.headers = { authorization: "Bearer invalid-token" };

      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Invalid or expired token",
      });
    });

    it("should set user on request and call next for valid token", () => {
      const payload = {
        userId: "user-1",
        email: "test@example.com",
        role: "USER",
      };
      const token = jwt.sign(payload, "default-secret");
      mockReq.headers = { authorization: `Bearer ${token}` };

      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockReq.user).toBeDefined();
      expect(mockReq.user!.userId).toBe("user-1");
      expect(mockReq.user!.email).toBe("test@example.com");
      expect(mockReq.user!.role).toBe("USER");
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("authorize", () => {
    it("should return 401 if no user on request", () => {
      const middleware = authorize("ADMIN");

      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it("should return 403 if user role is not in allowed roles", () => {
      mockReq.user = {
        userId: "user-1",
        email: "test@example.com",
        role: "USER",
      };
      const middleware = authorize("ADMIN");

      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Insufficient permissions",
      });
    });

    it("should call next if user role is allowed", () => {
      mockReq.user = {
        userId: "admin-1",
        email: "admin@example.com",
        role: "ADMIN",
      };
      const middleware = authorize("ADMIN");

      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("should allow multiple roles", () => {
      mockReq.user = {
        userId: "user-1",
        email: "user@example.com",
        role: "USER",
      };
      const middleware = authorize("USER", "ADMIN");

      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
