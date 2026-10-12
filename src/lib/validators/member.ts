import { z } from "zod";

export const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email invalide"),
  role: z.enum(["ADMIN", "MEMBER"]),
});
