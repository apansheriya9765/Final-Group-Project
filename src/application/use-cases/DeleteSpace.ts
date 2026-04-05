import { ISpaceRepository } from "../../domain/repositories/ISpaceRepository";
import { logger } from "../../infrastructure/logging/logger";

export class DeleteSpace {
  constructor(private spaceRepository: ISpaceRepository) {}

  async execute(id: string): Promise<void> {
    logger.info(`Deleting space: ${id}`);

    const space = await this.spaceRepository.findById(id);
    if (!space) {
      throw new Error("Space not found");
    }

    await this.spaceRepository.delete(id);

    logger.info(`Space ${id} deleted successfully`);
  }
}
