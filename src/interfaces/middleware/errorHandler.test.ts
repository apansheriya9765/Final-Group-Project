import { Request, Response, NextFunction } from "express";
import { ZodError, ZodIssue } from "zod";
import { errorHandler, AppError } from "./errorHandler";

jest.mock("../../infrastructure/logging/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("errorHandler", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = { path: "/test", method: "GET" };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it("should handle AppError with correct status code", () => {
    const error = new AppError("Not found", 404);

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Not found" });
  });

  it("should handle ZodError with 400 status", () => {
    const zodIssue: ZodIssue = {
      code: "invalid_type",
      expected: "string",
      received: "number",
      path: ["email"],
      message: "Expected string",
    };
    const error = new ZodError([zodIssue]);

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Validation failed",
      details: [{ field: "email", message: "Expected string" }],
    });
  });

  it("should handle unknown errors with 500 status", () => {
    const error = new Error("Something went wrong");

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Internal server error",
    });
  });
});
