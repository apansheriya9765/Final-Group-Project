import { CreateSpace } from "./CreateSpace";
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

describe("CreateSpace", () => {
  let createSpace: CreateSpace;
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
    createSpace = new CreateSpace(mockSpaceRepository);
  });

  it("should create a new space successfully", async () => {
    const spaceData = {
      name: "Desk C1",
      type: SpaceType.DESK,
      capacity: 1,
      pricePerHour: 12,
      amenities: ["WiFi", "Monitor"],
    };

    const createdSpace: Space = {
      id: "space-new",
      ...spaceData,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockSpaceRepository.create.mockResolvedValue(createdSpace);

    const result = await createSpace.execute(spaceData);

    expect(result.id).toBe("space-new");
    expect(result.name).toBe("Desk C1");
    expect(result.type).toBe(SpaceType.DESK);
    expect(mockSpaceRepository.create).toHaveBeenCalledWith(spaceData);
  });

  it("should create a private pod space", async () => {
    const podData = {
      name: "Pod D1",
      type: SpaceType.PRIVATE_POD,
      capacity: 6,
      pricePerHour: 40,
      amenities: ["WiFi", "Projector", "Whiteboard"],
    };

    const createdPod: Space = {
      id: "space-pod",
      ...podData,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockSpaceRepository.create.mockResolvedValue(createdPod);

    const result = await createSpace.execute(podData);

    expect(result.type).toBe(SpaceType.PRIVATE_POD);
    expect(result.capacity).toBe(6);
  });
});
