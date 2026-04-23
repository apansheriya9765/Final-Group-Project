import request from "supertest";
import app from "./app";

jest.mock("./infrastructure/logging/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

jest.mock("./infrastructure/database/prismaClient", () => ({
  __esModule: true,
  default: {
    user: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn() },
    space: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    booking: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
    $on: jest.fn(),
  },
}));

describe("App", () => {
  it("GET /api/health should return 200 OK", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("OK");
    expect(res.body.timestamp).toBeDefined();
  });

  it("GET /nonexistent should return 404", async () => {
    const res = await request(app).get("/nonexistent");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Route not found");
  });

  it("should mount auth routes at /api/auth", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    // Should hit the route (400 for validation, not 404)
    expect(res.status).not.toBe(404);
  });

  it("should mount space routes at /api/spaces", async () => {
    const res = await request(app).get("/api/spaces");
    expect(res.status).not.toBe(404);
  });

  it("should mount booking routes at /api/bookings", async () => {
    const res = await request(app).get("/api/bookings/availability");
    expect(res.status).not.toBe(404);
  });
});
