import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().trim().min(1, "Indica o teu nome."),
  email: z.string().trim().email("Indica um email válido."),
  phone: z.string().trim().optional().or(z.literal("")),
  message: z.string().trim().optional().or(z.literal("")),
  // honeypot: real users never fill this hidden field, bots usually do.
  company: z.string().max(0, "Falha na validação.").optional().or(z.literal("")),
});

export const commentSchema = z.object({
  authorName: z.string().trim().min(1, "Indica o teu nome."),
  authorEmail: z.string().trim().email("Indica um email válido."),
  body: z.string().trim().min(3, "Escreve um comentário um pouco mais longo."),
  company: z.string().max(0, "Falha na validação.").optional().or(z.literal("")),
});
