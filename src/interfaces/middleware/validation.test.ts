import {
  registerSchema,
  loginSchema,
  createSpaceSchema,
  updateSpaceSchema,
  createBookingSchema,
} from "./validation";

describe("Validation Schemas", () => {
  describe("registerSchema", () => {
    it("should validate a correct registration payload", () => {
      const result = registerSchema.parse({ email: "a@b.com", password: "123456", name: "Jo" });
      expect(result.email).toBe("a@b.com");
    });

    it("should reject invalid email", () => {
      expect(() => registerSchema.parse({ email: "bad", password: "123456", name: "Jo" })).toThrow();
    });

    it("should reject short password", () => {
      expect(() => registerSchema.parse({ email: "a@b.com", password: "12", name: "Jo" })).toThrow();
    });

    it("should reject short name", () => {
      expect(() => registerSchema.parse({ email: "a@b.com", password: "123456", name: "J" })).toThrow();
    });
  });

  describe("loginSchema", () => {
    it("should validate correct login", () => {
      const result = loginSchema.parse({ email: "a@b.com", password: "x" });
      expect(result.email).toBe("a@b.com");
    });

    it("should reject empty password", () => {
      expect(() => loginSchema.parse({ email: "a@b.com", password: "" })).toThrow();
    });
  });

  describe("createSpaceSchema", () => {
    it("should validate correct space data", () => {
      const result = createSpaceSchema.parse({
        name: "Desk",
        type: "DESK",
        capacity: 1,
        pricePerHour: 10,
      });
      expect(result.amenities).toEqual([]);
    });

    it("should reject invalid type", () => {
      expect(() => createSpaceSchema.parse({ name: "D", type: "INVALID", capacity: 1, pricePerHour: 10 })).toThrow();
    });

    it("should reject negative capacity", () => {
      expect(() => createSpaceSchema.parse({ name: "D", type: "DESK", capacity: -1, pricePerHour: 10 })).toThrow();
    });
  });

  describe("updateSpaceSchema", () => {
    it("should allow partial updates", () => {
      const result = updateSpaceSchema.parse({ name: "Updated" });
      expect(result.name).toBe("Updated");
      expect(result.type).toBeUndefined();
    });

    it("should allow empty object", () => {
      const result = updateSpaceSchema.parse({});
      expect(result).toEqual({});
    });

    it("should validate isAvailable boolean", () => {
      const result = updateSpaceSchema.parse({ isAvailable: false });
      expect(result.isAvailable).toBe(false);
    });
  });

  describe("createBookingSchema", () => {
    it("should validate correct booking data", () => {
      const result = createBookingSchema.parse({
        spaceId: "550e8400-e29b-41d4-a716-446655440000",
        date: "2026-05-01",
        startTime: "09:00",
        endTime: "17:00",
      });
      expect(result.spaceId).toBeDefined();
    });

    it("should reject invalid UUID", () => {
      expect(() => createBookingSchema.parse({ spaceId: "bad", date: "2026-05-01", startTime: "09:00", endTime: "10:00" })).toThrow();
    });

    it("should reject invalid time format", () => {
      expect(() => createBookingSchema.parse({ spaceId: "550e8400-e29b-41d4-a716-446655440000", date: "2026-05-01", startTime: "9am", endTime: "10:00" })).toThrow();
    });

    it("should allow optional guest fields", () => {
      const result = createBookingSchema.parse({
        spaceId: "550e8400-e29b-41d4-a716-446655440000",
        date: "2026-05-01",
        startTime: "09:00",
        endTime: "10:00",
        guestEmail: "guest@example.com",
        guestName: "Guest",
      });
      expect(result.guestEmail).toBe("guest@example.com");
    });
  });
});
