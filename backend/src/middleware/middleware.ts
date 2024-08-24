import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from "jsonwebtoken";
import { appConfig } from '../common/appConfig.js';

// export interface CustomRequest extends Request {
//     token: string | JwtPayload;
//    }

export async function verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        jwt.verify(token.split(' ')[1], appConfig.JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid token' });
            }
            //req.data = decoded;
            next();
        });
    } catch (error) {
        console.log("Error while verify token >>>>>>>>>>>", error);
        throw error;
    }
}