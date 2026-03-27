import { Space, CreateSpaceDTO } from "../entities/Space";
import { SpaceType } from "../entities/Space";

export interface ISpaceRepository {
  findById(id: string): Promise<Space | null>;
  findAll(): Promise<Space[]>;
  findByType(type: SpaceType): Promise<Space[]>;
  findAvailable(): Promise<Space[]>;
  create(data: CreateSpaceDTO): Promise<Space>;
  update(id: string, data: Partial<CreateSpaceDTO>): Promise<Space>;
}
