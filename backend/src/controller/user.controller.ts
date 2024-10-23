import { Request, Response, NextFunction } from 'express';
import bcrypt from "bcrypt";
import { CONST } from "../common/const.js";
import nodemailer from "nodemailer";
import path from "path";
import { htmlTemplateMaker } from "../html.js";
import { appConfig } from "../common/appConfig.js";
import twilio from 'twilio';
import jwt from "jsonwebtoken";
import multer from 'multer';
import multerS3 from 'multer-s3';
import AWS from 'aws-sdk';
import { S3Client } from '@aws-sdk/client-s3';
import userV1 from '../entity/userV1.entity.js';
import { userSessionV1 } from '../entity/userSessionV1.entity.js';
import User from '../models/user.model.js';
import UserSession from '../models/userSession.model.js';
import { ENUM } from '../common/enum.js';
import { sendLoginNotification, SignupNotification, LoginNotification, sendSignupNotification } from '../providers/rabbitmq/publisher.js';
// import { firebaseManager } from '../providers/firebase/firebase.manager.js';
// import { ENUM } from '../common/enum.js';

const client = twilio(appConfig.TWILIO_ACCOUNT_SID, appConfig.TWILIO_AUTH_TOKEN, { lazyLoading: true })

AWS.config.update({
    accessKeyId: appConfig.AWS_ACCESS_KEY_ID,
    secretAccessKey: appConfig.AWS_SECRET_ACCESS_KEY,
    region: appConfig.AWS_REGION
})
const s3 = new S3Client() //The aws-sdk provides the version 2 client. @aws-sdk/client-s3 is part of the V3 javascript SDK.
const bucketName = appConfig.AWS_S3_BUCKET_NAME

class UserController {

    async signup(req: Request, res: Response, next: NextFunction) {
        try {
            const userByEmail = await userV1.findOneByQuery({ email: req.body.email });
            if (userByEmail)
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

            const data = await userV1.createUser(payload);
            console.log("Signup Successfully >>>>>>>>>>>");

            return res.status(200).json({ message: `OTP send successfully!, ${JSON.stringify(otpResponses)}`, data: data });
        } catch (error) {
            console.log("Error while signup >>>>>>>>>>>", error);
            throw error;
        }
    }

    async verifyOtp(req: Request, res: Response, next: NextFunction) {
        try {
            const deviceDetails = {
                deviceId: req.query.deviceId,
                deviceToken: req.query.deviceToken
            }
            const userByMobile = await userV1.findOneByQuery({ mobile: req.body.mobile });
            if (!userByMobile)
                return res.status(404).json({ message: "This user does not exist" })
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
            await userV1.findOneAndUpdateUserByQuery({ mobile: mobile }, payload);
            //console.log("]]]]]]]]]]]",updatedData);
            // const fbData = await firebaseManager.addData(ENUM.COLLECTION.USER, userData._id.toString(),  updatedData);
            // console.log("??????????????????",fbData);

            //console.log("req.session>>>>>>>", req.session);
            //req.session.name = userData.name;
            //res.send('Session data set successfully!');

            const sessionPayload = {
                userId: userByMobile._id,
                deviceDetails: deviceDetails
            }
            const createSession = await userSessionV1.createUserSession(sessionPayload)
            const tokenPayload = {
                sessionId: createSession._id,
                userId: userByMobile._id,
                name: userByMobile.name,
                email: userByMobile.email
            }
            const token = jwt.sign(tokenPayload, appConfig.JWT_SECRET_KEY, { expiresIn: CONST.EXPIRY_JWT_TOKEN });

            const notification: SignupNotification = {
                userId: userByMobile._id.toString(),
                message: 'Congratulations! You have successfully signed up.',
            };
            await sendSignupNotification(notification);

            return res.status(200).send({ message: `OTP verified successfully!, ${JSON.stringify(verifyResponses)}`, data: token });
        } catch (error) {
            console.log("Error while verify otp >>>>>>>>>>>", error);
            throw error;
        }
    }

    async login(req: Request, res: Response, next: NextFunction) { // multi-device login
        try {
            const userByEmail = await userV1.findOneByQuery({ email: req.body.email });
            if (!userByEmail)
                return res.status(404).json({ message: "This email does not exist. Please enter the registered email" });
            const passwordMatch = await bcrypt.compare(req.body.password, userByEmail.password);
            if (!passwordMatch)
                return res.status(401).json({ message: "Incorrect password" })
            if (userByEmail.loginCount != 3) {
                const deviceDetails = {
                    deviceId: req.query.deviceId,
                    deviceToken: req.query.deviceToken
                }
                // console.log("req.session>>>>>>>", req.session.id);
                // req.session.id = userByEmail._id
                // res.send('Session data set successfully!');
                const sessionPayload = {
                    userId: userByEmail._id,
                    deviceDetails: deviceDetails
                }
                const createSession = await userSessionV1.createUserSession(sessionPayload);
                const tokenPayload = {
                    sessionId: createSession._id,
                    userId: userByEmail._id,
                    name: userByEmail.name,
                    email: userByEmail.email
                }
                const token = jwt.sign(tokenPayload, appConfig.JWT_SECRET_KEY, { expiresIn: CONST.EXPIRY_JWT_TOKEN });
                await User.updateOne({ email: req.body.email }, { $inc: { loginCount: +1 } });

                const notification: LoginNotification = {
                    userId: userByEmail._id.toString(),
                    message: 'You have successfully logged in!',
                  };
                  await sendLoginNotification(notification);

                return res.status(200).json({ message: "Logged In Successfully", data: token });
            } else if (userByEmail.isPrimaryAccountHolder == true) {
                const allDeviceData = await UserSession.find({ userId: userByEmail._id });
                // primary account holder can logout any user
                await UserSession.findOneAndUpdate({ _id: allDeviceData[0]._id }, { $set: { status: ENUM.STATUS.INACTIVE } }, { new: true });
                await User.updateOne({ email: req.body.email }, { $inc: { loginCount: -1 } });
                return res.status(400).json({ message: "Primary Account Holder successfully logout the secondary user." });
            } else {
                const userSessionData = await UserSession.find({ userId: userByEmail._id, status: ENUM.STATUS.INACTIVE });
                if (!userSessionData) return res.status(400).json({ message: "Sorry, all screens are busy." });
                const sessionToLogout = userSessionData[0].lastRecentActivity < userSessionData[1].lastRecentActivity ? userSessionData[1] : userSessionData[0]
                await UserSession.findOneAndUpdate({ _id: sessionToLogout._id }, { $set: { status: ENUM.STATUS.INACTIVE } }, { new: true });
                await User.updateOne({ email: req.body.email }, { $inc: { loginCount: -1 } });
                return res.status(400).json({ message: "Successful in logging out user who have been idle for the longest time" });

                // if (userSessionData[0].lastRecentActivity < userSessionData[1].lastRecentActivity) {
                //     await UserSession.findOneAndUpdate({ _id: userSessionData[1]._id }, { $set: { status: ENUM.STATUS.LOGOUT } }, { new: true });
                //     await User.updateOne({ email: req.body.email }, { $inc: { loginCount: -1 } });
                // } else {
                //     await UserSession.findOneAndUpdate({ _id: userSessionData[0]._id }, { $set: { status: ENUM.STATUS.LOGOUT } }, { new: true });
                //     await User.updateOne({ email: req.body.email }, { $inc: { loginCount: -1 } });
                // }
            }
        } catch (error) {
            console.log("Error while user login >>>>>>>>>>>", error);
            throw error;
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const userByEmail = await userV1.findOneByQuery({ email: req.body.email });
            if (!userByEmail)
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
            const html = await htmlTemplateMaker.makeHtmlTemplate(htmlTemplatePath, userByEmail.name);
            await transporter.sendMail({
                from: appConfig.EMAIL,
                to: req.body.email,
                subject: CONST.FORGOT_PASSWORD,
                text: "Have you forgotten your password ?",
                html: html
            });

            return res.status(200).json({ message: "Mail sent successfully", data: userByEmail._id })
        } catch (error) {
            console.log("Error while forgot Password >>>>>>>>>>>", error);
            throw error;
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const userById = await userV1.findOneByQuery({ _id: req.body.id });
            if (!userById)
                return res.status(400).json({ message: "This user does not exist" })
            const hashedPassword: string = await bcrypt.hash(req.body.newPassword, CONST.saltRounds)
            if (hashedPassword == userById.password) {
                return res.status(400).json({ message: "New password can not be same as of old password" });
            }
            if (req.body.newPassword != req.body.confirmPassword) {
                return res.status(400).json({ message: "Confirm password does not match with new password" });
            } else {
                await userV1.findOneAndUpdateUserByQuery({ _id: userById }, { password: hashedPassword });

                return res.status(200).json({ message: "Password reset successfully" });
            }
        } catch (error) {
            console.log("Error while reset Password >>>>>>>>>>>", error);
            throw error;
        }
    }

    async changePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const hashedPassword: string = await bcrypt.hash(req.body.newPassword, CONST.saltRounds)
            const userData = res.locals.data;
            console.log("userData", userData);
            if (hashedPassword == userData.password) {
                return res.status(400).json({ message: "New password can not be same as of old password" });
            }
            if (req.body.newPassword != req.body.confirmPassword) {
                return res.status(400).json({ message: "Confirm password does not match with new password" });
            } else {
                await userV1.findOneAndUpdateUserByQuery({ _id: userData.userId }, { password: hashedPassword });

                return res.status(200).json({ message: "Password changed successfully" });
            }
        } catch (error) {
            console.log("Error while change password >>>>>>>>>>>", error);
            throw error;
        }
    }

    async details(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("PPP", res.locals.data);
            const userDetails = await userV1.findOneByQuery({ _id: res.locals.data.userId });
            if (userDetails) {
                console.log("User details fetched successfully >>>>>>>>>>>");
                return res.status(200).json({ message: 'User details fetched successfully', data: userDetails });
            } else {
                return res.status(404).json({ message: "This user does not exist" });
            }
        } catch (error) {
            console.log("Error while fetching user details >>>>>>>>>>>", error);
            throw error;
        }
    }

    async completeProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userDetails = await userV1.findOneByQuery({ _id: res.locals.data.userId });
            if (!userDetails)
                return res.status(404).json({ message: "This user does not exist" })

            const upload = multer({   // this is setting up the config of multer and configuring the middleware to handle a single file upload
                storage: multerS3({
                    s3: s3,
                    bucket: bucketName,
                    //acl: 'private',
                    contentType: multerS3.AUTO_CONTENT_TYPE,
                    key: function (req, file, cb) {
                        cb(null, file.originalname)
                    }
                })
            }).single('profileImage');

            upload(req, res, async (err: any) => { // actual file upload process begins.
                //multer starts processing the incoming request, uploads the file to S3, including handling the file upload as per the configuration 
                if (err) {
                    console.log("Error while uploading profile image >>>>>>>>>>>", err);
                    return res.status(500).json({ message: 'Error uploading profile image', error: err });
                }

                console.log(req.file);
                console.log("completeProfile Successfully >>>>>>>>>>>");
                return res.status(200).json({ message: 'Profile Image Uploaded successfully', data: req.file });
            });
        } catch (error) {
            console.log("Error while completeProfile >>>>>>>>>>>", error);
            next(error);
        }
    }


    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const userDetails = await userV1.findOneByQuery({ _id: res.locals.data.userId });
            if (!userDetails) {
                return res.status(400).json({ message: "This user does not exist" })
            } else {
                await userV1.findOneAndUpdateUserByQuery({ _id: res.locals.data.userId }, { status: ENUM.STATUS.INACTIVE });
                console.log("User logout Successfully >>>>>>>>>>>>>>>>");

                return res.status(200).json({ message: "User logout successfully " });
            }
        } catch (error) {
            console.log("Error while fetching user >>>>>>>>>>>", error);
            throw error;
        }
    }
}

export const userController = new UserController();