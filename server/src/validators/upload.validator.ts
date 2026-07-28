import { z } from "zod";

export const UploadIdParamSchema = z.object({
  id: z.string().uuid("Invalid upload ID format"),
});
