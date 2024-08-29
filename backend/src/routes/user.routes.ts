import express, { Request, Response, NextFunction } from 'express';
import User from '../models/user.model.js';
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
import UserSession from '../models/userSession.model.js';
import multer from 'multer';
import multerS3 from 'multer-s3';
import AWS from 'aws-sdk';
import { S3Client } from '@aws-sdk/client-s3';
const router = express.Router();
const client = twilio(appConfig.TWILIO_ACCOUNT_SID, appConfig.TWILIO_AUTH_TOKEN, { lazyLoading: true })

AWS.config.update({
    accessKeyId: appConfig.AWS_ACCESS_KEY_ID,
    secretAccessKey: appConfig.AWS_SECRET_ACCESS_KEY,
    region: appConfig.AWS_REGION
})
const s3 = new S3Client() //The aws-sdk provides the version 2 client. @aws-sdk/client-s3 is part of the V3 javascript SDK.
const bucketName = appConfig.AWS_S3_BUCKET_NAME

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: bucketName,
        //acl: 'private',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            cb(null, file.originalname)
        }
    })
});

router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData = await User.findOne({ email: req.body.email });
        if (userData)
            return res.status(404).json({ message: "This email already exists" })

        const hashedPassword: string = await bcrypt.hash(req.body.password, CONST.saltRounds)

        const { countryCode, mobile } = req.body;
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
            password: hashedPassword,
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

        const userData: any = await User.findOne({ mobile: mobile });

        const sessionPayload = {
            userId: userData._id,
            deviceDetails: req.headers
        }

        const createSession = await UserSession.create(sessionPayload)

        const tokenPayload = {
            sessionId: createSession._id,
            userId: userData._id,
            name: userData.name,
            email: userData.email
        }
        const token = jwt.sign(tokenPayload, appConfig.JWT_SECRET_KEY, { expiresIn: CONST.EXPIRY_JWT_TOKEN });

        return res.status(200).send({ message: `OTP verified successfully!, ${JSON.stringify(verifyResponses)}`, data: token });
    } catch (error) {
        console.log("Error while verify otp >>>>>>>>>>>", error);
        throw error;
    }
})

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData: any = await User.findOne({ email: req.body.email });
        if (!userData)
            return res.status(404).json({ message: "This email does not exist. Please enter the registered email" })

        const passwordMatch = await bcrypt.compare(req.body.password, userData.password)
        if (!passwordMatch)
            return res.status(401).json({ message: "Incorrect password" })

        const sessionPayload = {
            userId: userData._id,
            deviceDetails: req.headers
        }

        const createSession = await UserSession.create(sessionPayload)

        const tokenPayload = {
            sessionId: createSession._id,
            userId: userData._id,
            name: userData.name,
            email: userData.email
        }
        const token = jwt.sign(tokenPayload, appConfig.JWT_SECRET_KEY, { expiresIn: CONST.EXPIRY_JWT_TOKEN });

        return res.status(200).json({ message: "Logged In Successfully", data: token });
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

router.post('/changePassword', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const oldPassword = await User.findOne({ password: req.body.newPassword });
        if (req.body.newPassword == oldPassword?.password) {
            return res.status(400).json({ message: "New password can not be same as of old password" });
        }
        if (req.body.newPassword != req.body.confirmPassword) {
            return res.status(400).json({ message: "Confirm password does not match with new password" });
        } else {
            await User.findOneAndUpdate({ _id: res.locals.data.userId, password: req.body.newPassword });

            return res.status(200).json({ message: "Password changed successfully" });
        }
    } catch (error) {
        console.log("Error while change password >>>>>>>>>>>", error);
        throw error;
    }
})

router.get('/details', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log("PPP", res.locals.data);
        const data = await User.findOne({ _id: res.locals.data.userId });
        if (data) {
            console.log("User details fetched successfully >>>>>>>>>>>");
            return res.status(200).json({ message: 'User details fetched successfully', data: data });
        } else {
            return res.status(404).json({ message: "This user does not exist" });
        }
    } catch (error) {
        console.log("Error while fetching user details >>>>>>>>>>>", error);
        throw error;
    }
})

router.put('/completeProfile', verifyToken,  upload.single('profileImage'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData = await User.findOne({ _id: res.locals.data.userId });
        if (!userData)
            return res.status(404).json({ message: "This user does not exist" })
        console.log(req.file);
        console.log("completeProfile Successfully >>>>>>>>>>>");
        return res.status(200).json({ message: 'Profile Image Uploaded successfully', data: req.file });
    } catch (error) {
        console.log("Error while completeProfile >>>>>>>>>>>", error);
        throw error;
    }
})

router.post('/logout', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData = await User.findOne({ _id: res.locals.data.userId });
        if (!userData) {
            return res.status(400).json({ message: "This user does not exist" })
        } else {
            await User.findOneAndUpdate({ _id: res.locals.data.userId, status: ENUM.STATUS.INACTIVE });
            console.log("User logout Successfully >>>>>>>>>>>>>>>>");

            return res.status(200).json({ message: "User logout successfully " });
        }
    } catch (error) {
        console.log("Error while fetching user >>>>>>>>>>>", error);
        throw error;
    }
})

export { router };

