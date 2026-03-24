import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod'; 

export const validateBody = (schema: ZodTypeAny) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Erro de validação',
                    errors: error.issues.map(({ path, message }) => ({
                        field: path.join('.'),
                        message,
                    })),
                });
            }
            next(error);
        }
    };