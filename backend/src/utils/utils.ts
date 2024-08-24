import * as jwt from 'jsonwebtoken';
import { appConfig } from "../common/appConfig.js";

export function createJwtToken(userData: any) {
    try {
        const payload = {
            email: userData.email,
            name: userData.name,
        };
        return jwt.sign(payload, appConfig.JWT_SECRET_KEY, { expiresIn: '1h' });

    }catch(error) {
        console.log("Error while create jwt token  >>>>>>>>>>>", error);
        throw error;
    }
}

export async function verifyJwtToken(userData: any) {
    try {
        const payload = {
            id: userData._id,
            name: userData.name,
        };
        return jwt.sign(payload, appConfig.JWT_SECRET_KEY, { expiresIn: '1h' });

    }catch(error) {

    }
}