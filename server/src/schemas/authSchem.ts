// src/schemas/auth.schema.ts
//
// All auth input shapes are defined here with Zod.
// The controller calls these before touching the service.

import { string, z } from "zod";
import { UserRole } from "../types/type.js";

// ─── Reusable field definitions ───────────────────────────────────────────────

const emailField = z
  .string({ error: "Email is required" })
  .trim()
  .toLowerCase()
  .email("Please provide a valid email address");

const passwordField = z
  .string({ error: "Password is required" })
  .min(6, "Password must be at least 6 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  );

const nameField = (label: string) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(2, `${label} must be at least 2 characters`)
    .max(50, `${label} cannot exceed 50 characters`);

// ─── 1. Register Schema ───────────────────────────────────────────────────────

export const RegisterSchema = z
  .object({
    firstName: nameField("First name"),
    email: emailField,
    password: passwordField,
    role: z
      .enum(["student", "admin"], {
        error: "Role must be student or admin",
      })
      .optional()
      .default(UserRole.STUDENT),
  });

export type RegisterInput = z.infer<typeof RegisterSchema>;

// ─── 2. Login Schema ──────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: emailField,
  password: z
    .string({ error: "Password is required" })
    .min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// ─── 3. Verify Email OTP Schema ───────────────────────────────────────────────

export const VerifyEmailSchema = z.object({
  email: emailField,
  otp: z
    .string({ error: "OTP is required" })
    .trim()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
});

export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;

// ─── 4. Resend OTP Schema ─────────────────────────────────────────────────────

export const ResendOtpSchema = z.object({
  email: emailField,
});

export type ResendOtpInput = z.infer<typeof ResendOtpSchema>;

// ─── 5. Google Login Schema ───────────────────────────────────────────────────

export const GoogleLoginSchema = z.object({
  idToken: z
    .string({ error: "Google ID token is required" })
    .trim()
    .min(1, "Google ID token cannot be empty"),
});

export type GoogleLoginInput = z.infer<typeof GoogleLoginSchema>;

// ─── 6. Refresh Token Schema ──────────────────────────────────────────────────

export const RefreshTokenSchema = z.object({
  refreshToken: z
    .string({ error: "Refresh token is required" })
    .trim()
    .min(1, "Refresh token cannot be empty"),
});

export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
