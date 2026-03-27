import prisma from "../database/prismaClient";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User, CreateUserDTO } from "../../domain/entities/User";

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: CreateUserDTO): Promise<User> {
    return prisma.user.create({ data });
  }

  async findAll(): Promise<User[]> {
    return prisma.user.findMany();
  }
}
