import { ISpaceRepository } from "../../domain/repositories/ISpaceRepository";
import { Space, SpaceType } from "../../domain/entities/Space";
import { logger } from "../../infrastructure/logging/logger";

export class GetSpaces {
  constructor(private spaceRepository: ISpaceRepository) {}

  async execute(type?: SpaceType): Promise<Space[]> {
    logger.info(`Fetching spaces${type ? ` of type: ${type}` : ""}`);

    if (type) {
      return this.spaceRepository.findByType(type);
    }

    return this.spaceRepository.findAvailable();
  }
}
