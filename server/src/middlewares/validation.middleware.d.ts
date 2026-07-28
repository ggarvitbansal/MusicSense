import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
export declare const validate: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=validation.middleware.d.ts.map