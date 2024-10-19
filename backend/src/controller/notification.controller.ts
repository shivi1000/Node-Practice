import { Request, Response, NextFunction } from 'express';
import userV1 from '../entity/userV1.entity.js';
import notificationV1 from '../entity/notificationV1.entity.js';
import UserSession from '../models/userSession.model.js';
import User from '../models/user.model.js';
import firebaseModule from '../providers/firebase/firebase.connection.js';

class NotificationController {

    async sendNotification(req: Request, res: Response, next: NextFunction) {
        try {
            const senderDetails = await userV1.findOneByQuery({ _id: res.locals.data.userId });
            if (!senderDetails)
                return res.status(404).json({ message: "This sender does not exist" })

            const receiverDetails = await User.findOne({ _id: req.body.receiver.id });
            if (!receiverDetails) {
                return res.status(404).json({ message: "This receiver does not exist" });
            }

            const senderInfo = {
                id: senderDetails._id,
                name: senderDetails.name,
            };
            const receiverInfo = {
                id: req.body.receiver.id,
                name: receiverDetails.name,
            };
            const payload = {
                title: req.body.title,
                description: req.body.description,
                imageUrl: req.body.imageUrl,
                status: req.body.status,
                sender: senderInfo,
                receiver: receiverInfo
            }
            const sessionData = await UserSession.findOne({ userId: req.body.receiver.id });
            if (!sessionData || !sessionData.deviceDetails) {
                return res.status(404).json({ message: "Receiver session data not found" });
            }
            const deviceToken = sessionData.deviceDetails.deviceToken;
            if (!deviceToken) {
                return res.status(404).json({ message: "Device token not found" });
            }
            const notificationData = {
                data: {
                    title: payload.title,
                    body: payload.description,
                },
                notification: {
                    title: payload.title,
                    body: payload.description,
                }
            };
            const data = await notificationV1.createNotification(payload);
            await firebaseModule.sendPush(deviceToken, notificationData);
            return res.status(200).json({ message: `Notification send successfully!`, data: data });
        } catch (error) {
            console.log("Error while sendNotification >>>>>>>>>>>", error);
            throw error;
        }
    }


    async listing(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await userV1.findOneByQuery({ _id: res.locals.data.userId });
            if (data) {
                let notificationDetails;
                if (req.query.notificationId) {
                    notificationDetails = await notificationV1.findDetails(req.query.notificationId );
                    return res.status(200).json({ message: 'Notification details fetched successfully', data: notificationDetails });
                } else {
                    notificationDetails = await notificationV1.findAllNotificationsForUser({ "receiver.id": data._id });
                }
                return res.status(200).json({ message: 'Notification list fetched successfully', data: notificationDetails });
            } else {
                return res.status(404).json({ message: "User not found" });
            }
        } catch (error) {
            console.log("Error while listing >>>>>>>>>>>", error);
            throw error;
        }
    }
}

export const notificationController = new NotificationController();