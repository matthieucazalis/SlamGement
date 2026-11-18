import { z } from "zod";

export const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email("validation.email"),
  role: z.enum(["ADMIN", "MEMBER"]),
});

export const roleSchema = z.enum(["ADMIN", "MEMBER"]);
