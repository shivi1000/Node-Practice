import express from "express"
import { User } from "../models/user.model.js";
import { ENUM } from "../../common/enum.js";
const router = express.Router();

router.post('/signup', async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.body.email });
        if (userData) {
            return res.status(400).json({ message: "This email already exists" })
        }
        const data = await User.create(req.body);
        console.log("User created Successfully >>>>>>>>>>>>>>>>");
        return res.status(200).json(data);
    } catch (error) {
        console.log("Error while creating user >>>>>>>>>>>", error);
        throw error;
    }
})

router.post('/login', async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.body.email });
        if (!userData) {
            return res.status(400).json({ message: "This email does not exist. Please enter the registered email" })
        }
        const savedPassword = await User.findOne({ password: req.body.password });
        console.log("savedPassword", savedPassword?.password);
        if (req.body.password != savedPassword?.password) {
            return res.status(400).json({ message: "Incorrect password" })
        }
        const data = await User.findOne({ email: req.body.email, password: req.body.password });
        if (data) {
            console.log("User fetched Successfully >>>>>>>>>>>>>>>>");
            return res.status(200).json({message: "Logged In Successfully"});
        }
    } catch (error) {
        console.log("Error while fetching user >>>>>>>>>>>", error);
        throw error;
    }
})

router.post('/forgotPassword', async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.body.email });
        if (!userData) {
            return res.status(400).json({ message: "This email does not exists" })
        } else {
            return res.status(200).json(userData._id)
        }
    } catch (error) {
        console.log("Error while forgot Password >>>>>>>>>>>", error);
        throw error;
    }
})

router.post('/resetPassword', async (req, res) => {
    try {
        const userData = await User.findOne({ _id: req.body.id });
        if (!userData) {
            return res.status(400).json({ message: "This user does not exist" })
        }
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