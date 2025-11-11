import { z } from "zod";

/**
 * Schema for validating login requests
 */
export const loginRequestSchema = z.object({
  email: z.string({ message: "Email is required" }).min(1, { message: "Email is required" }),
  //.email({ message: "Please enter a valid email address" }),
  password: z.string({ message: "Password is required" }).min(1, { message: "Password is required" }),
});

export type LoginRequestDTO = z.infer<typeof loginRequestSchema>;

/**
 * Schema for validating forgot password requests
 */
export const forgotPasswordRequestSchema = z.object({
  email: z.string({ message: "Email is required" }).email({ message: "Please enter a valid email address" }),
});

export type ForgotPasswordRequestDTO = z.infer<typeof forgotPasswordRequestSchema>;

/**
 * Schema for validating login responses
 */
export const loginResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    user_metadata: z.record(z.unknown()).optional(),
  }),
  session: z
    .object({
      access_token: z.string(),
      refresh_token: z.string().optional(),
    })
    .optional(),
});

export type LoginResponseDTO = z.infer<typeof loginResponseSchema>;

/**
 * Schema for validating signup requests
 */
export const signupRequestSchema = z.object({
  email: z.string({ message: "Email is required" }).email({ message: "Please enter a valid email address" }),
  password: z.string({ message: "Password is required" }).min(8, { message: "Password must be at least 8 characters" }),
});

export type SignupRequestDTO = z.infer<typeof signupRequestSchema>;

export const signupSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

/**
 * Schema for validating update password requests
 */
export const updatePasswordRequestSchema = z.object({
  newPassword: z
    .string({ message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" }),
});

export type UpdatePasswordRequestDTO = z.infer<typeof updatePasswordRequestSchema>;

export const updatePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .refine((password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$/.test(password), {
        message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });
