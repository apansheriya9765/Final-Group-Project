import { GetSpaces } from "./GetSpaces";
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

describe("GetSpaces", () => {
  let getSpaces: GetSpaces;
  let mockSpaceRepository: jest.Mocked<ISpaceRepository>;

  const mockSpaces: Space[] = [
    {
      id: "space-1",
      name: "Desk A1",
      type: SpaceType.DESK,
      capacity: 1,
      pricePerHour: 10,
      amenities: ["WiFi", "Power Outlet"],
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "space-2",
      name: "Pod B1",
      type: SpaceType.PRIVATE_POD,
      capacity: 4,
      pricePerHour: 25,
      amenities: ["WiFi", "Whiteboard", "Monitor"],
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    mockSpaceRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByType: jest.fn(),
      findAvailable: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    getSpaces = new GetSpaces(mockSpaceRepository);
  });

  it("should return all available spaces when no type filter", async () => {
    mockSpaceRepository.findAvailable.mockResolvedValue(mockSpaces);

    const result = await getSpaces.execute();

    expect(result).toEqual(mockSpaces);
    expect(mockSpaceRepository.findAvailable).toHaveBeenCalled();
  });

  it("should return spaces filtered by type", async () => {
    const desks = [mockSpaces[0]];
    mockSpaceRepository.findByType.mockResolvedValue(desks);

    const result = await getSpaces.execute(SpaceType.DESK);

    expect(result).toEqual(desks);
    expect(mockSpaceRepository.findByType).toHaveBeenCalledWith(SpaceType.DESK);
  });
});
