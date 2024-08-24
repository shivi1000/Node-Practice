import express, { Request, Response, NextFunction } from 'express';
import { User } from "../models/user.model.js";
import { ENUM } from "../common/enum.js";
import bcrypt from "bcrypt";
import { CONST } from "../common/const.js";
import nodemailer from "nodemailer";
import path from "path";
import { htmlTemplateMaker } from "../html.js";
import { appConfig } from "../common/appConfig.js";
import twilio from 'twilio';
import jwt from "jsonwebtoken";
import { verifyToken } from '../middleware/middleware.js';
const router = express.Router();
const client = twilio(appConfig.TWILIO_ACCOUNT_SID, appConfig.TWILIO_AUTH_TOKEN, { lazyLoading: true })

router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData = await User.findOne({ email: req.body.email });
        if (userData)
            return res.status(404).json({ message: "This email already exists" })

        const { countryCode, mobile } = req.body;
        const plainPassword: string = await bcrypt.hash(req.body.password, CONST.saltRounds)

        const otpResponses = await client.verify.v2
            .services(appConfig.TWILIO_SERVICE_SID)
            .verifications.create({
                to: `+${countryCode}${mobile}`,
                channel: 'sms',
            });

        const payload = {
            name: req.body.name,
            email: req.body.email,
            countryCode: req.body.countryCode,
            mobile: req.body.mobile,
            password: plainPassword,
            status: req.body.status
        }
        const data = await User.create(payload);
        console.log("Signup Successfully >>>>>>>>>>>");
        return res.status(200).json({ message: `OTP send successfully!, ${JSON.stringify(otpResponses)}`, data: data });
    } catch (error) {
        console.log("Error while signup >>>>>>>>>>>", error);
        throw error;
    }
})

router.post('/verify-otp', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { countryCode, mobile, otp } = req.body;
        const verifyResponses = await client.verify.v2
            .services(appConfig.TWILIO_SERVICE_SID)
            .verificationChecks.create({
                to: `+${countryCode}${mobile}`,
                code: otp,
            });

        let payload;
        if (verifyResponses.status == 'approved') {
            payload = {
                otp: req.body.otp,
                isOtpVerified: true
            }
        }
        await User.findOneAndUpdate({ mobile: mobile }, { $set: payload }, { new: true })
        return res.status(200).send(`OTP verified successfully!, ${JSON.stringify(verifyResponses)}`);
    } catch (error) {
        console.log("Error while verify otp >>>>>>>>>>>", error);
        throw error;
    }
})

router.post('/login', async (req: Request, res: Response) => {
    try {
        const userData: any = await User.findOne({ email: req.body.email });
        if (!userData)
            return res.status(404).json({ message: "This email does not exist. Please enter the registered email" })
        const passwordMatch = await bcrypt.compare(req.body.password, userData.password)
        if (!passwordMatch) {
            return res.status(401).json({ message: "Incorrect password" })
        } else {
            console.log("User fetched Successfully >>>>>>>>>>>>>>>>");
            const token = jwt.sign({userData}, appConfig.JWT_SECRET_KEY, { expiresIn: '1h' });
            return res.status(200).json({ message: "Logged In Successfully", data: token });
        }
    } catch (error) {
        console.log("Error while fetching user >>>>>>>>>>>", error);
        throw error;
    }
})

router.post('/forgotPassword', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData = await User.findOne({ email: req.body.email });
        if (!userData)
            return res.status(400).json({ message: "This email does not exists" })
        const transporter = nodemailer.createTransport({
            service: appConfig.SERVICE,
            host: appConfig.HOST,
            port: Number(appConfig.PORT),
            secure: false,
            auth: {
                user: appConfig.EMAIL,
                pass: appConfig.PASSWORD,
            },
        });
        const htmlTemplatePath = path.join(CONST.EMAIL_TEMPLATES);
        const html = await htmlTemplateMaker.makeHtmlTemplate(htmlTemplatePath, userData.name);
        await transporter.sendMail({
            from: appConfig.EMAIL,
            to: req.body.email,
            subject: CONST.FORGOT_PASSWORD,
            text: "Have you forgotten your password ?",
            html: html
        });
        return res.status(200).json({ message: "Mail sent successfully", data: userData._id })
    } catch (error) {
        console.log("Error while forgot Password >>>>>>>>>>>", error);
        throw error;
    }
})

router.post('/resetPassword', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData = await User.findOne({ _id: req.body.id });
        if (!userData)
            return res.status(400).json({ message: "This user does not exist" })
        const oldPassword = await User.findOne({ password: req.body.newPassword });
        if (req.body.newPassword == oldPassword?.password) {
            return res.status(400).json({ message: "New password can not be same as of old password" });
        }
        if (req.body.newPassword != req.body.confirmPassword) {
            return res.status(400).json({ message: "Confirm password does not match with new password" });
        } else {
            await User.findOneAndUpdate({ _id: req.body.id, password: req.body.newPassword });
            return res.status(200).json({ message: "Password reset successfully" });
        }
    } catch (error) {
        console.log("Error while reset Password >>>>>>>>>>>", error);
        throw error;
    }
})

router.post('/changePassword', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const oldPassword = await User.findOne({ password: req.body.newPassword });
        if (req.body.newPassword == oldPassword?.password) {
            return res.status(400).json({ message: "New password can not be same as of old password" });
        }
        if (req.body.newPassword != req.body.confirmPassword) {
            return res.status(400).json({ message: "Confirm password does not match with new password" });
        } else {
            await User.findOneAndUpdate({ _id: req.body.id, password: req.body.newPassword });
            return res.status(200).json({ message: "Password changed successfully" });
        }
    } catch (error) {
        console.log("Error while change password >>>>>>>>>>>", error);
        throw error;
    }
})

router.get('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await User.findOne({ _id: req.params.id });
        if (!data) {
            return res.status(404).json({ message: "This user does not exist" });
        } else {
            console.log("User details fetched successfully >>>>>>>>>>>");
            return res.status(200).json(data);
        }
    } catch (error) {
        console.log("Error while fetching user details >>>>>>>>>>>", error);
        throw error;
    }
})

router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData = await User.findOne({ _id: req.body.id });
        if (!userData) {
            return res.status(400).json({ message: "This user does not exist" })
        } else {
            await User.findOneAndUpdate({ _id: req.body.id, status: ENUM.STATUS.INACTIVE });
            console.log("User logout Successfully >>>>>>>>>>>>>>>>");
            return res.status(200).json({ message: "User logout successfully " });
        }
    } catch (error) {
        console.log("Error while fetching user >>>>>>>>>>>", error);
        throw error;
    }
})

export { router };

