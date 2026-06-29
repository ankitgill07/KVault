import { string, z } from "zod";
import bcrypt from "bcrypt";
import Otp from "../models/otpModel.js";
import { type OAuth2Client } from "google-auth-library";
import { UserRole } from "../types/type.js";

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

export const RegisterSchema = z.object({
  name: nameField("Name"),
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

export const LoginSchema = z.object({
  email: emailField,
  password: z
    .string({ error: "Password is required" })
    .min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

const otpField = z
  .string({ error: "OTP is required" })
  .length(6, "OTP must be exactly 6 digits");

export const VerifyOtpSchema = z.object({
  email: emailField,
  otp: otpField,
});

export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;

export const ResendOtpSchema = z.object({
  email: emailField,
});

export type ResendOtpInput = z.infer<typeof ResendOtpSchema>;

export const GoogleAuthSchema = z.object({
  idToken: z.string({ error: "ID token is required" }),
});

export type GoogleAuthInput = z.infer<typeof GoogleAuthSchema>;
