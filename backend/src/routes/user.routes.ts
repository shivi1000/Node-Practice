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
import { authentication, verifyToken } from '../middleware/middleware.js';
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

/**
 * @swagger
 * /api/v1/signup:
 *   post:
 *     tags: [User - OnBoarding]
 *     summary: Register a new user
 *     description: This api allows users to register by providing necessary details such as name, email, countryCode, mobile, password, etc.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: john_doe
 *                 description: Name for the user
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *                 description: Unique user's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *                 description: Strong password for the user
 *               countryCode:
 *                 type: string
 *                 example: +91
 *                 description: User's country code
 *               mobile:
 *                 type: string
 *                 example: 9876543210
 *                 description: User's phone number
 *             required:
 *               - name
 *               - email
 *               - countryCode
 *               - mobile
 *               - password
 *     responses:
 *       200:
 *         description: Signup successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Signup successful
 *                 userId:
 *                   type: string
 *                   example: 6123c1e8d74e3a0b8800000c
 *       400:
 *         description: Bad request - invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid email format
 *       401:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User already exists
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Server error, please try again later
 *     security:
 *       - apiKeyAuth: []
 */


router.post('/signup', authentication, async (req: Request, res: Response, next: NextFunction) => {
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

/**
 * @swagger
 * /api/v1/verify-otp:
 *   post:
 *     tags: [User - OnBoarding]
 *     summary: Verify OTP for user authentication
 *     description: This API is used to verify the OTP (One Time Password) sent to the user's mobile phone for authentication purposes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - countryCode
 *               - mobile
 *               - otp
 *             properties:
 *               countryCode:
 *                 type: string
 *                 example: "+91"
 *                 description: The country code of the user's mobile number.
 *               mobile:
 *                 type: string
 *                 example: "1234567890"
 *                 description: The mobile number of the user.
 *               otp:
 *                 type: string
 *                 example: "123456"
 *                 description: The OTP sent to the user's mobile number.
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP verified successfully!"
 *                 data:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                   description: JWT token for the session
 *       400:
 *         description: Bad Request - Missing or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid OTP"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error while verifying OTP"
 */

router.post('/verify-otp', authentication, async (req: Request, res: Response, next: NextFunction) => {
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

/**
 * @swagger
 * /api/v1/login:
 *   post:
 *     tags: [User - OnBoarding]
 *     summary: User login
 *     description: Authenticate a user with email and password, returning a JWT token upon successful login.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Passw0rd!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged In Successfully
 *                 data:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Bad request (e.g., missing or invalid parameters)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid request data
 *       401:
 *         description: Incorrect password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Incorrect password
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: This email does not exist. Please enter the registered email.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error while fetching user
 */


router.post('/login', authentication, async (req: Request, res: Response, next: NextFunction) => {
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

/**
 * @swagger
 * /api/v1/forgotPassword:
 *   post:
 *     tags: [User - OnBoarding]
 *     summary: Send forgot password email
 *     description: Sends an email with a password reset link to the user if the email is registered.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Email sent successfully for forgot password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mail sent successfully
 *                 data:
 *                   type: string
 *                   example: 6123456789abcdef12345678
 *       400:
 *         description: Bad request (e.g., email not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: This email does not exist
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error while processing forgot password request
 */


router.post('/forgotPassword', authentication, async (req: Request, res: Response, next: NextFunction) => {
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

/**
 * @swagger
 * /api/v1/resetPassword:
 *   post:
 *     tags: [User - OnBoarding]
 *     summary: Reset a user's password
 *     description: Allows a user to reset their password. Requires the user ID and new password, and checks for password confirmation and validity.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *                 example: 6123456789abcdef12345678
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewP@ssw0rd!
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: NewP@ssw0rd!
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset successfully
 *       400:
 *         description: Bad request (e.g., user not found, password mismatch, or password unchanged)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: This user does not exist or New password cannot be same as old password or Confirm password does not match with new password
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error while resetting password
 */


router.post('/resetPassword', authentication, async (req: Request, res: Response, next: NextFunction) => {
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

/**
 * @swagger
 * /api/v1/changePassword:
 *   post:
 *     tags: [User - OnBoarding]
 *     summary: Change a user's password
 *     description: Allows a user to change their password. Requires old and new passwords and checks for password confirmation and validity.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewP@ssw0rd!
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: NewP@ssw0rd!
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password changed successfully
 *       400:
 *         description: Bad request (e.g., password mismatch, unchanged password)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: New password cannot be same as old password or Confirm password does not match with new password
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: This user does not exist
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error while changing password
 */


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

/**
 * @swagger
 * /api/v1/details:
 *   get:
 *     tags: [User - OnBoarding]
 *     summary: Fetch user details
 *     description: Retrieves user details based on the user's ID provided in the token.
 *     responses:
 *       200:
 *         description: User details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User details fetched successfully
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: This user does not exist
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error while fetching user details
 */


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

/**
 * @swagger
 * /api/v1/completeProfile:
 *   put:
 *     tags: [User - OnBoarding]
 *     summary: Upload a profile image
 *     description: Allows a user to upload their profile image. The image is provided as a file in the form-data.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: The profile image file to upload.
 *     responses:
 *       200:
 *         description: Profile image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile Image Uploaded successfully
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: This user does not exist
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error while uploading profile image
 */

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

/**
 * @swagger
 * /api/v1/logout:
 *   post:
 *     tags: [User - OnBoarding]
 *     summary: Logout a user
 *     description: Logs out a user by updating their status to inactive.
 *     responses:
 *       200:
 *         description: Logout successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User logout successfully
 *       400:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: This user does not exist
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error while logging out
 */


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

