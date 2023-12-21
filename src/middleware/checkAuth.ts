import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import "dotenv/config";

const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.json({
            isSuccess: false,
            mensaje: 'Token is required'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY as string);
        if (typeof decoded === 'object') {
            req.body.user = decoded;
            next();
        } else {
            return res.status(401).json({
                isSuccess: false,
                mensaje: 'Invalid token'
            });
        }
    } catch (err: any) {
        //Validar si el token ha expirado o no
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                isSuccess: false,
                mensaje: 'Token Expirado'
            });
        } else if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                isSuccess: false,
                mensaje: 'Token Invalido'
            });
        }
    }
};

const verificarToken = (req: Request, res: Response) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.json({
            isSuccess: false,
            mensaje: 'Token es requerido'
        });
    }

    try {
        // Devolver el token decodificado con el tiempo de expiración
        const decode = jwt.verify(token, process.env.SECRET_KEY as string);
        return res.json({
            isSuccess: true,
            mensaje: 'Token Valido',
            data: decode
        });
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return res.json({
                isSuccess: false,
                mensaje: 'Token Expirado'
            });
        } else if (err instanceof jwt.JsonWebTokenError) {
            return res.json({
                isSuccess: false,
                mensaje: 'Token Invalido'
            });
        }
    }
};

export { checkAuth, verificarToken }