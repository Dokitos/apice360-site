import { z } from "zod";

export const groupSchema = z.object({
  name: z.string().trim().min(1, "Indica o nome do grupo."),
});
