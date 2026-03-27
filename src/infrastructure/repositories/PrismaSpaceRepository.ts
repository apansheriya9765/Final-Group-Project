import prisma from "../database/prismaClient";
import { ISpaceRepository } from "../../domain/repositories/ISpaceRepository";
import { Space, CreateSpaceDTO, SpaceType } from "../../domain/entities/Space";

export class PrismaSpaceRepository implements ISpaceRepository {
  async findById(id: string): Promise<Space | null> {
    return prisma.space.findUnique({ where: { id } });
  }

  async findAll(): Promise<Space[]> {
    return prisma.space.findMany();
  }

  async findByType(type: SpaceType): Promise<Space[]> {
    return prisma.space.findMany({ where: { type } });
  }

  async findAvailable(): Promise<Space[]> {
    return prisma.space.findMany({ where: { isAvailable: true } });
  }

  async create(data: CreateSpaceDTO): Promise<Space> {
    return prisma.space.create({ data });
  }

  async update(id: string, data: Partial<CreateSpaceDTO>): Promise<Space> {
    return prisma.space.update({ where: { id }, data });
  }
}
