import { UpdateSpace } from "./UpdateSpace";
import { ISpaceRepository } from "../../domain/repositories/ISpaceRepository";
import { Space, SpaceType } from "../../domain/entities/Space";

jest.mock("../../infrastructure/logging/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("UpdateSpace", () => {
  let updateSpace: UpdateSpace;
  let mockSpaceRepository: jest.Mocked<ISpaceRepository>;

  const mockSpace: Space = {
    id: "space-1",
    name: "Desk A1",
    type: SpaceType.DESK,
    capacity: 1,
    pricePerHour: 10,
    amenities: ["WiFi"],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockSpaceRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByType: jest.fn(),
      findAvailable: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    updateSpace = new UpdateSpace(mockSpaceRepository);
  });

  it("should update a space successfully", async () => {
    mockSpaceRepository.findById.mockResolvedValue(mockSpace);
    mockSpaceRepository.update.mockResolvedValue({
      ...mockSpace,
      name: "Desk A1 - Premium",
      pricePerHour: 15,
    });

    const result = await updateSpace.execute("space-1", {
      name: "Desk A1 - Premium",
      pricePerHour: 15,
    });

    expect(result.name).toBe("Desk A1 - Premium");
    expect(result.pricePerHour).toBe(15);
  });

  it("should throw error if space not found", async () => {
    mockSpaceRepository.findById.mockResolvedValue(null);

    await expect(
      updateSpace.execute("nonexistent", { name: "New Name" })
    ).rejects.toThrow("Space not found");
  });

  it("should toggle space availability", async () => {
    mockSpaceRepository.findById.mockResolvedValue(mockSpace);
    mockSpaceRepository.update.mockResolvedValue({
      ...mockSpace,
      isAvailable: false,
    });

    const result = await updateSpace.execute("space-1", {
      isAvailable: false,
    });

    expect(result.isAvailable).toBe(false);
  });
});
