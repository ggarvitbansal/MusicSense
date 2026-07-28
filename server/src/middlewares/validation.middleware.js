import { z } from "zod";
export const validate = (schema) => {
    return async (req, res, next) => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    success: false,
                    message: error.issues[0]?.message || "Validation error",
                    errors: error.issues.map((err) => ({
                        field: err.path.join("."),
                        message: err.message,
                    })),
                });
                return;
            }
            next(error);
        }
    };
};
//# sourceMappingURL=validation.middleware.js.map