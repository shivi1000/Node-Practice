import { Request, Response, NextFunction } from 'express';
import { CONST } from '../common/const.js';
import bcrypt from 'bcrypt';
import userAIV1 from '../entity/userAI.entity.js';
class UserAIController {
    async signup(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, email, countryCode, mobile, password } = req.body;
            const userData = await userAIV1.userExistsByMobile(mobile);
            if (userData)
                return res.status(409).json({ message: "User already exists with this mobile number" });
            const hashedPassword: string = await bcrypt.hash(password, CONST.saltRounds)
            const payload = {
                name,
                email,
                countryCode,
                mobile,
                password: hashedPassword
            }
            const data = await userAIV1.createUser(payload);
            console.log("Signup Successfully >>>>>>>>>>>");
            return res.status(201).json({ message: "User created successfully", data });
        } catch (error) {
            console.log("Error while signup >>>>>>>>>>>", error);
            next(error);
        }
    }

}
export const userAIController = new UserAIController();