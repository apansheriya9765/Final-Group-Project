import prisma from "../database/prismaClient";
import { ISpaceRepository } from "../../domain/repositories/ISpaceRepository";
import { Space, CreateSpaceDTO, SpaceType } from "../../domain/entities/Space";

type PrismaSpace = Awaited<ReturnType<typeof prisma.space.findUnique>>;

function toDomain(space: NonNullable<PrismaSpace>): Space {
  return { ...space, type: space.type as SpaceType };
}

export class PrismaSpaceRepository implements ISpaceRepository {
  async findById(id: string): Promise<Space | null> {
    const space = await prisma.space.findUnique({ where: { id } });
    return space ? toDomain(space) : null;
  }

  async findAll(): Promise<Space[]> {
    const spaces = await prisma.space.findMany();
    return spaces.map(toDomain);
  }

  async findByType(type: SpaceType): Promise<Space[]> {
    const spaces = await prisma.space.findMany({ where: { type } });
    return spaces.map(toDomain);
  }

  async findAvailable(): Promise<Space[]> {
    const spaces = await prisma.space.findMany({ where: { isAvailable: true } });
    return spaces.map(toDomain);
  }

  async create(data: CreateSpaceDTO): Promise<Space> {
    const space = await prisma.space.create({ data });
    return toDomain(space);
  }

  async update(id: string, data: Partial<CreateSpaceDTO>): Promise<Space> {
    const space = await prisma.space.update({ where: { id }, data });
    return toDomain(space);
  }

  async delete(id: string): Promise<void> {
    await prisma.space.delete({ where: { id } });
  }
}
