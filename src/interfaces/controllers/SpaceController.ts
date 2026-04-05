import { Request, Response } from "express";
import { GetSpaces } from "../../application/use-cases/GetSpaces";
import { CreateSpace } from "../../application/use-cases/CreateSpace";
import { PrismaSpaceRepository } from "../../infrastructure/repositories/PrismaSpaceRepository";
import { createSpaceSchema } from "../middleware/validation";
import { SpaceType } from "../../domain/entities/Space";
import { logger } from "../../infrastructure/logging/logger";

const spaceRepository = new PrismaSpaceRepository();

export class SpaceController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const type = req.query.type as SpaceType | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const getSpaces = new GetSpaces(spaceRepository);
      const allSpaces = await getSpaces.execute(type);

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedSpaces = allSpaces.slice(startIndex, endIndex);

      res.status(200).json({
        spaces: paginatedSpaces,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(allSpaces.length / limit),
          totalItems: allSpaces.length,
          itemsPerPage: limit,
        },
      });
    } catch (error: any) {
      logger.error(`Get spaces error: ${error.message}`);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createSpaceSchema.parse(req.body);
      const createSpace = new CreateSpace(spaceRepository);
      const space = await createSpace.execute(validatedData);

      res.status(201).json({
        message: "Space created successfully",
        space,
      });
    } catch (error: any) {
      logger.error(`Create space error: ${error.message}`);

      if (error.name === "ZodError") {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }

      res.status(500).json({ error: "Internal server error" });
    }
  }
}
