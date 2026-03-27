import bcrypt from "bcrypt";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { CreateUserDTO, UserResponse } from "../../domain/entities/User";
import { logger } from "../../infrastructure/logging/logger";

export class RegisterUser {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: CreateUserDTO): Promise<UserResponse> {
    logger.info(`Registering new user with email: ${data.email}`);

    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      logger.warn(`Registration failed: Email ${data.email} already exists`);
      throw new Error("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    logger.info(`User registered successfully: ${user.id}`);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
