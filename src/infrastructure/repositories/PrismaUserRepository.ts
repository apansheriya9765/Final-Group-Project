import prisma from "../database/prismaClient";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User, CreateUserDTO, UserRole } from "../../domain/entities/User";

type PrismaUser = Awaited<ReturnType<typeof prisma.user.findUnique>>;

function toDomain(user: NonNullable<PrismaUser>): User {
  return { ...user, role: user.role as UserRole };
}

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? toDomain(user) : null;
  }

  async create(data: CreateUserDTO): Promise<User> {
    const user = await prisma.user.create({ data });
    return toDomain(user);
  }

  async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany();
    return users.map(toDomain);
  }
}
