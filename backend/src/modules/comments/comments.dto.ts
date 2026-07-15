import { z } from "zod";

export const createCommentSchema = z.object({
  message: z.string().trim().min(1, "Message is required").max(2000),
});
export type CreateCommentDto = z.infer<typeof createCommentSchema>;
