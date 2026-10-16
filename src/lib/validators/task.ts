import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().trim().min(2, "2 caractères minimum").max(120),
  description: z
    .string()
    .trim()
    .max(5000, "5000 caractères maximum")
    .optional()
    .transform((v) => (v ? v : undefined)),
  dueDate: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || /^\d{4}-\d{2}-\d{2}$/.test(v), {
      message: "Date invalide",
    })
    .transform((v) => (v ? new Date(`${v}T00:00:00.000Z`) : undefined))
    .refine((d) => d === undefined || !Number.isNaN(d.getTime()), {
      message: "Date invalide",
    }),
  assigneeId: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export type TaskInput = z.infer<typeof taskSchema>;
