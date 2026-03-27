import { Request, Response } from "express";
import { RegisterUser } from "../../application/use-cases/RegisterUser";
import { LoginUser } from "../../application/use-cases/LoginUser";
import { PrismaUserRepository } from "../../infrastructure/repositories/PrismaUserRepository";
import { registerSchema, loginSchema } from "../middleware/validation";
import { logger } from "../../infrastructure/logging/logger";

const userRepository = new PrismaUserRepository();

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = registerSchema.parse(req.body);
      const registerUser = new RegisterUser(userRepository);
      const user = await registerUser.execute(validatedData);

      res.status(201).json({
        message: "User registered successfully",
        user,
      });
    } catch (error: any) {
      logger.error(`Registration error: ${error.message}`);

      if (error.name === "ZodError") {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }

      if (error.message === "User with this email already exists") {
        res.status(409).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body);
      const loginUser = new LoginUser(userRepository);
      const result = await loginUser.execute(validatedData);

      res.status(200).json({
        message: "Login successful",
        ...result,
      });
    } catch (error: any) {
      logger.error(`Login error: ${error.message}`);

      if (error.name === "ZodError") {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }

      if (error.message === "Invalid email or password") {
        res.status(401).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: "Internal server error" });
    }
  }
}
