import { z } from "zod";

export const SaveTextInputSchema = z.object({
  content: z.string().min(1),
});

export const TextInfoSchema = z.object({
  textId: z.string(),
  content: z.string(),
  size: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const TextListSchema = z.object({
  texts: z.array(z.string()),
});

export type SaveTextInput = z.infer<typeof SaveTextInputSchema>;
export type TextInfo = z.infer<typeof TextInfoSchema>;
export type TextList = z.infer<typeof TextListSchema>; 