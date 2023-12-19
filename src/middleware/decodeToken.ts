import jwt from 'jsonwebtoken';
import { Usuario } from '../interfaces/usuario';

export const decodeToken = (token: string): Usuario | null => {
    const decoded = jwt.verify(token, process.env.SECRET_KEY as string);
    if (typeof decoded === 'object') {
        return decoded as Usuario;
    } else {
        return null;
    }
}