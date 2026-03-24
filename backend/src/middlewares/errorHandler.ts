import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

const BUSINESS_ERRORS: Record<string, number> = {
    USER_NOT_FOUND: 404,
    INVALID_CREDENTIALS: 401,
    CPF_ALREADY_EXISTS: 409,
    EMAIL_ALREADY_EXISTS: 409,
    STATE_ALREADY_EXISTS: 409,     
    LICENSE_PLATE_ALREADY_EXISTS: 409, 
};

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
    logger.error('Erro na requisição', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    const status = BUSINESS_ERRORS[err.message] ?? err.status ?? 500;

    const messageMap: Record<string, string> = {
        USER_NOT_FOUND: 'Usuário não encontrado',
        INVALID_CREDENTIALS: 'E-mail ou senha incorretos',
        CPF_ALREADY_EXISTS: 'CPF já cadastrado',         
        EMAIL_ALREADY_EXISTS: 'E-mail já cadastrado',
        STATE_ALREADY_EXISTS: 'Estado já cadastrado',         
        LICENSE_PLATE_ALREADY_EXISTS: 'Placa já cadastrada', 
    };

    const message = messageMap[err.message] ?? (status === 500 ? 'Erro interno do servidor' : err.message);

    res.status(status).json({ success: false, message });
};