import express, { Request, Response, NextFunction } from 'express';
import jwt from "jsonwebtoken";
import { appConfig } from '../common/appConfig.js';
const app = express();

export async function authentication(req: Request, res: Response, next: NextFunction) {
    try {
        const authheader: any = req.headers.authorization;
        // console.log(req.headers);
        // console.log('authheader', authheader)
        if (!authheader) {
            let err = new Error('You are not authenticated!');
            res.setHeader('WWW-Authenticate', 'Basic');
            return res.status(401).json({ message: err.message })
        }
        const auth = Buffer.from(authheader.split(' ')[1],'base64').toString().split(':');
        const user = auth[0];
        const pass = auth[1];

        if (user == 'admin' && pass == 'password') {
            next();
        } else {
            let err = new Error('You are not authenticated!');
            res.setHeader('WWW-Authenticate', 'Basic');
            return res.status(401).json({ message: err.message })
        }
    } catch (error) {
        console.log("Error while authentication >>>>>>>>>>>", error);
        throw error;
    }
}

export async function verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        jwt.verify(token.split(' ')[1], appConfig.JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(403).json({ err });
            }
            res.locals.data = decoded;
            next();
        });
    } catch (error) {
        console.log("Error while verify token >>>>>>>>>>>", error);
        throw error;
    }
}
