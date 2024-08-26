import express, { Request, Response, NextFunction } from 'express';
import jwt from "jsonwebtoken";
import { appConfig } from '../common/appConfig.js';
import session from 'express-session';
const app = express();

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
            //req.user = decoded;
            return next();
        });
    } catch (error) {
        console.log("Error while verify token >>>>>>>>>>>", error);
        throw error;
    }
}

export async function createSession() {
    try {
        app.use(session({
            secret: appConfig.JWT_SECRET_KEY,
            resave: false,
            saveUninitialized: false
          }));

    } catch (error) {
        console.log("Error while create session >>>>>>>>>>>", error);
        throw error;
    }
}
