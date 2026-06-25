import { type Request, type Response,type NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { sendError } from '../utils/responseUtil.js';


export const validateBody =
  <T>(schema: z.ZodType<T>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = formatZodErrors(result.error);
      sendError(res, 'Validation failed', 422, errors);
      return;
    }

    req.body = result.data;
    next();
  };


const formatZodErrors = (error: ZodError): string[] => {
  return error.issues.map((issue) => {
    const path = issue.path.join('.');
    return path ? `${path}: ${issue.message}` : issue.message;
  });
};