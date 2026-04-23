jest.mock("../../infrastructure/logging/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

jest.mock("@prisma/client", () => {
  const mockOn = jest.fn();
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      $on: mockOn,
      user: {},
      space: {},
      booking: {},
    })),
  };
});

describe("PrismaClient", () => {
  it("should create and export a PrismaClient instance", () => {
    const prisma = require("./prismaClient").default;
    expect(prisma).toBeDefined();
    expect(prisma.$on).toBeDefined();
  });

  it("should register event listeners for query and error", () => {
    const prisma = require("./prismaClient").default;
    expect(prisma.$on).toHaveBeenCalledWith("query", expect.any(Function));
    expect(prisma.$on).toHaveBeenCalledWith("error", expect.any(Function));
  });
});
