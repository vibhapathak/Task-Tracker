import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Must be a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type SignupDto = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Must be a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginDto = z.infer<typeof loginSchema>;

export interface AuthResponseDto {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}
