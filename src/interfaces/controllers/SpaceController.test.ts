import { Request, Response } from "express";
import { SpaceController } from "./SpaceController";
import { SpaceType } from "../../domain/entities/Space";

jest.mock("../../infrastructure/logging/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

jest.mock("../../infrastructure/repositories/PrismaSpaceRepository");

const mockGetSpacesExecute = jest.fn();
const mockCreateSpaceExecute = jest.fn();
const mockUpdateSpaceExecute = jest.fn();
const mockDeleteSpaceExecute = jest.fn();

jest.mock("../../application/use-cases/GetSpaces", () => ({
  GetSpaces: jest.fn().mockImplementation(() => ({ execute: mockGetSpacesExecute })),
}));
jest.mock("../../application/use-cases/CreateSpace", () => ({
  CreateSpace: jest.fn().mockImplementation(() => ({ execute: mockCreateSpaceExecute })),
}));
jest.mock("../../application/use-cases/UpdateSpace", () => ({
  UpdateSpace: jest.fn().mockImplementation(() => ({ execute: mockUpdateSpaceExecute })),
}));
jest.mock("../../application/use-cases/DeleteSpace", () => ({
  DeleteSpace: jest.fn().mockImplementation(() => ({ execute: mockDeleteSpaceExecute })),
}));

describe("SpaceController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { query: {}, body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("getAll", () => {
    it("should return paginated spaces", async () => {
      const spaces = [
        { id: "1", name: "Desk A1", type: SpaceType.DESK, capacity: 1, pricePerHour: 10, amenities: [], isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
        { id: "2", name: "Desk A2", type: SpaceType.DESK, capacity: 1, pricePerHour: 10, amenities: [], isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
      ];
      mockGetSpacesExecute.mockResolvedValue(spaces);
      req.query = { page: "1", limit: "10" };

      await SpaceController.getAll(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        spaces: expect.any(Array),
        pagination: expect.objectContaining({ currentPage: 1, totalItems: 2 }),
      }));
    });

    it("should filter by type if provided", async () => {
      mockGetSpacesExecute.mockResolvedValue([]);
      req.query = { type: "DESK" };

      await SpaceController.getAll(req as Request, res as Response);

      expect(mockGetSpacesExecute).toHaveBeenCalledWith("DESK");
    });

    it("should return 500 on error", async () => {
      mockGetSpacesExecute.mockRejectedValue(new Error("DB error"));

      await SpaceController.getAll(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("create", () => {
    it("should create a space and return 201", async () => {
      const spaceData = { name: "New Pod", type: SpaceType.PRIVATE_POD, capacity: 4, pricePerHour: 25, amenities: ["WiFi"] };
      req.body = spaceData;
      const created = { id: "1", ...spaceData, isAvailable: true, createdAt: new Date(), updatedAt: new Date() };
      mockCreateSpaceExecute.mockResolvedValue(created);

      await SpaceController.create(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: "Space created successfully", space: created });
    });

    it("should return 400 for validation errors", async () => {
      req.body = { name: "", type: "INVALID" };

      await SpaceController.create(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 500 for unexpected errors", async () => {
      req.body = { name: "Desk", type: SpaceType.DESK, capacity: 1, pricePerHour: 10, amenities: [] };
      mockCreateSpaceExecute.mockRejectedValue(new Error("DB error"));

      await SpaceController.create(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("update", () => {
    it("should update a space and return 200", async () => {
      req.params = { id: "space-1" };
      req.body = { name: "Updated Desk" };
      const updated = { id: "space-1", name: "Updated Desk", type: SpaceType.DESK, capacity: 1, pricePerHour: 10, amenities: [], isAvailable: true, createdAt: new Date(), updatedAt: new Date() };
      mockUpdateSpaceExecute.mockResolvedValue(updated);

      await SpaceController.update(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 400 for validation errors", async () => {
      req.params = { id: "space-1" };
      req.body = { capacity: -1 };

      await SpaceController.update(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 if space not found", async () => {
      req.params = { id: "nonexistent" };
      req.body = { name: "Updated" };
      mockUpdateSpaceExecute.mockRejectedValue(new Error("Space not found"));

      await SpaceController.update(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 500 for unexpected errors", async () => {
      req.params = { id: "space-1" };
      req.body = { name: "Updated" };
      mockUpdateSpaceExecute.mockRejectedValue(new Error("DB error"));

      await SpaceController.update(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("remove", () => {
    it("should delete a space and return 200", async () => {
      req.params = { id: "space-1" };
      mockDeleteSpaceExecute.mockResolvedValue(undefined);

      await SpaceController.remove(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Space deleted successfully" });
    });

    it("should return 404 if space not found", async () => {
      req.params = { id: "nonexistent" };
      mockDeleteSpaceExecute.mockRejectedValue(new Error("Space not found"));

      await SpaceController.remove(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 500 for unexpected errors", async () => {
      req.params = { id: "space-1" };
      mockDeleteSpaceExecute.mockRejectedValue(new Error("DB error"));

      await SpaceController.remove(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
