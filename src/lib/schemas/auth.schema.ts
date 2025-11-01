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
