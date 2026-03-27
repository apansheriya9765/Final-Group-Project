import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { logger } from "../../infrastructure/logging/logger";

interface LoginDTO {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export class LoginUser {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: LoginDTO): Promise<LoginResponse> {
    logger.info(`Login attempt for email: ${data.email}`);

    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      logger.warn(`Login failed: User not found for email ${data.email}`);
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      logger.warn(`Login failed: Invalid password for email ${data.email}`);
      throw new Error("Invalid email or password");
    }

    const secret = process.env.JWT_SECRET || "default-secret";
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: "24h" } as jwt.SignOptions
    );

    logger.info(`User logged in successfully: ${user.id}`);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
