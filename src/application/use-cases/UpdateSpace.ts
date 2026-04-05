import { ISpaceRepository } from "../../domain/repositories/ISpaceRepository";
import { Space, CreateSpaceDTO } from "../../domain/entities/Space";
import { logger } from "../../infrastructure/logging/logger";

export class UpdateSpace {
  constructor(private spaceRepository: ISpaceRepository) {}

  async execute(
    id: string,
    data: Partial<CreateSpaceDTO> & { isAvailable?: boolean }
  ): Promise<Space> {
    logger.info(`Updating space: ${id}`);

    const space = await this.spaceRepository.findById(id);
    if (!space) {
      throw new Error("Space not found");
    }

    const updated = await this.spaceRepository.update(id, data);

    logger.info(`Space ${id} updated successfully`);
    return updated;
  }
}
