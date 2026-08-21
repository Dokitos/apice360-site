import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Indica o nome."),
  email: z.string().trim().email("Indica um email válido."),
  password: z.string().min(8, "A palavra-passe precisa de pelo menos 8 caracteres."),
  role: z.enum(["ADMIN", "EDITOR"]),
  groupId: z.string().trim().optional().or(z.literal("")),
  isActive: z.boolean(),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(1, "Indica o nome."),
  email: z.string().trim().email("Indica um email válido."),
  password: z
    .string()
    .min(8, "A palavra-passe precisa de pelo menos 8 caracteres.")
    .optional()
    .or(z.literal("")),
  role: z.enum(["ADMIN", "EDITOR"]),
  groupId: z.string().trim().optional().or(z.literal("")),
  isActive: z.boolean(),
});
