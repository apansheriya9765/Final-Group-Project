import { logger } from "./logger";

describe("Logger", () => {
  it("should be defined and have standard log methods", () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.debug).toBe("function");
  });

  it("should log info without throwing", () => {
    expect(() => logger.info("test info message")).not.toThrow();
  });

  it("should log error without throwing", () => {
    expect(() => logger.error("test error message")).not.toThrow();
  });

  it("should log warn without throwing", () => {
    expect(() => logger.warn("test warn message")).not.toThrow();
  });
});
