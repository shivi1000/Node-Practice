import express from "express"
import { User } from "../models/user.model.js";
import { ENUM } from "../common/enum.js";
import bcrypt from "bcrypt";
import { CONST } from "../common/const.js";
import nodemailer from "nodemailer";
import path from "path";
import { htmlTemplateMaker } from "../html.js";
import * as dotenv from "dotenv";
dotenv.config();
const router = express.Router();

const SERVICE = process.env.SERVICE;
const HOST = process.env.HOST;
const PORT = Number(process.env.PORT);
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

router.post('/signup', async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.body.email });
        if (userData)
            return res.status(404).json({ message: "This email already exists" })
        const plainPassword: string = await bcrypt.hash(req.body.password, CONST.saltRounds)
        const payload = {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            password: plainPassword,
            status: req.body.status
        }
        const data = await User.create(payload);
        console.log("User created Successfully >>>>>>>>>>>>>>>>");
        return res.status(200).json(data);
    } catch (error) {
        console.log("Error while creating user >>>>>>>>>>>", error);
        throw error;
    }
})

router.post('/login', async (req, res) => {
    try {
        const userData: any = await User.findOne({ email: req.body.email });
        if (!userData)
            return res.status(404).json({ message: "This email does not exist. Please enter the registered email" })
        const passwordMatch = await bcrypt.compare(req.body.password, userData.password)
        console.log("passwordMatch", passwordMatch);
        console.log("userData.password", userData.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Incorrect password" })
        } else {
            console.log("User fetched Successfully >>>>>>>>>>>>>>>>");
            return res.status(200).json({ message: "Logged In Successfully" });
        }
    } catch (error) {
        console.log("Error while fetching user >>>>>>>>>>>", error);
        throw error;
    }
})

router.post('/forgotPassword', async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.body.email });
        if (!userData)
            return res.status(400).json({ message: "This email does not exists" })
        const transporter = nodemailer.createTransport({
            service: SERVICE,
            host: HOST,
            port: PORT,
            secure: false,
            auth: {
                user: EMAIL,
                pass: PASSWORD,
            },
        });
        const htmlTemplatePath = path.join(CONST.EMAIL_TEMPLATES);
        const html = await htmlTemplateMaker.makeHtmlTemplate(htmlTemplatePath,userData.name);
            await transporter.sendMail({
                from: EMAIL, 
                to: req.body.email,
                subject: CONST.FORGOT_PASSWORD, 
                text: "Have you forgotten your password ?",
                html: html
            });
            return res.status(200).json({message: "Mail sent successfully", data: userData._id})
        } catch (error) {
            console.log("Error while forgot Password >>>>>>>>>>>", error);
            throw error;
        }
    })

router.post('/resetPassword', async (req, res) => {
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

router.post('/changePassword', async (req, res) => {
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

router.get('/:id', async (req, res) => {
    try {
        const data = await User.findOne({ _id: req.params.id });
        if (!data) {
            return res.status(400).json({ message: "This user does not exist" });
        } else {
            console.log("User details fetched successfully >>>>>>>>>>>");
            return res.status(200).json(data);
        }
    } catch (error) {
        console.log("Error while fetching user details >>>>>>>>>>>", error);
        throw error;
    }
})

router.post('/logout', async (req, res) => {
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