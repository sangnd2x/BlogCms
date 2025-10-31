import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ pattern: z.regexes.email }),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.email({ pattern: z.regexes.email }),
  username: z.string("Username is required"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
  userRole: z.string(),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
