import { DeleteSpace } from "./DeleteSpace";
import { ISpaceRepository } from "../../domain/repositories/ISpaceRepository";
import { SpaceType } from "../../domain/entities/Space";

jest.mock("../../infrastructure/logging/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("DeleteSpace", () => {
  let deleteSpace: DeleteSpace;
  let mockSpaceRepository: jest.Mocked<ISpaceRepository>;

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
    deleteSpace = new DeleteSpace(mockSpaceRepository);
  });

  it("should delete a space successfully", async () => {
    mockSpaceRepository.findById.mockResolvedValue({
      id: "space-1",
      name: "Desk A1",
      type: SpaceType.DESK,
      capacity: 1,
      pricePerHour: 10,
      amenities: ["WiFi"],
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockSpaceRepository.delete.mockResolvedValue();

    await expect(deleteSpace.execute("space-1")).resolves.not.toThrow();
    expect(mockSpaceRepository.delete).toHaveBeenCalledWith("space-1");
  });

  it("should throw error if space not found", async () => {
    mockSpaceRepository.findById.mockResolvedValue(null);

    await expect(deleteSpace.execute("nonexistent")).rejects.toThrow(
      "Space not found"
    );
  });
});
