import { ISpaceRepository } from "../../domain/repositories/ISpaceRepository";
import { Space, CreateSpaceDTO } from "../../domain/entities/Space";
import { logger } from "../../infrastructure/logging/logger";

export class CreateSpace {
  constructor(private spaceRepository: ISpaceRepository) {}

  async execute(data: CreateSpaceDTO): Promise<Space> {
    logger.info(`Creating new space: ${data.name} (${data.type})`);

    const space = await this.spaceRepository.create(data);

    logger.info(`Space created successfully: ${space.id}`);
    return space;
  }
}
