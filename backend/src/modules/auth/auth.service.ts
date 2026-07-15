import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { authRepository } from "./auth.repository";
import { AuthResponseDto, LoginDto, SignupDto } from "./auth.dto";

const SALT_ROUNDS = 10;

function issueToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn } as SignOptions
  );
}

function toAuthResponse(user: { id: string; name: string; email: string; role: string }, token: string): AuthResponseDto {
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

export const authService = {
  async signup(dto: SignupDto): Promise<AuthResponseDto> {
    const existing = await authRepository.findByEmail(dto.email);
    if (existing) {
      throw ApiError.conflict("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    // New signups are always MEMBER by default; an Admin can promote
    // them afterwards via PUT /api/users/{id}/role.
    const user = await authRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });

    const token = issueToken(user);
    return toAuthResponse(user, token);
  },

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await authRepository.findByEmail(dto.email);
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const token = issueToken(user);
    return toAuthResponse(user, token);
  },
};
