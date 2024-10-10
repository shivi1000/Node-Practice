import express, { Request, Response, NextFunction } from 'express';
import { middleware } from '../middleware/auth.middleware.js';
import { celebrate, Joi, Segments } from 'celebrate';
import { notificationController } from '../controller/notification.controller.js';
import { ENUM } from '../common/enum.js';
const notificationRouter = express.Router();

/**
 * @swagger
 * /api/v1/notification/send:
 *   post:
 *     tags: [User - Notification]
 *     summary: Sends notification to a user
 *     description: This api allows users to send notification to a user by providing necessary details such as title, description, imageUrl, status, sender, receiver, etc.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title for the notification
 *               description:
 *                 type: string
 *                 description: Description for the notification
 *               imageUrl:
 *                 type: string
 *                 description: Image URL for the notification
 *               status:
 *                 type: number
 *                 description: Status for the notification
 *               receiver:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Receiver ID
 *             required:
 *               - title
 *               - description
 *               - imageUrl
 *               - status
 *               - receiver
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notification sent successfully
 *       400:
 *         description: Bad request - invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid input
 *       404:
 *         description: Not Found -  Sender does not exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Sender does not exists
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

notificationRouter.post('/send',
    celebrate({
        [Segments.BODY]: Joi.object().keys({
            title: Joi.string().required(),
            description: Joi.string().required(),
            imageUrl: Joi.string().required(),
            status: Joi.string().required().valid(...Object.values(ENUM.NOTIFICATION_STATUS)),
            receiver: Joi.object().keys({
                id: Joi.string().required(),
            }).required(),
        }),
    }),
    middleware.verifyToken,
    async (req: Request, res: Response, next: NextFunction) => {
        await notificationController.sendNotification(req, res, next);
    })

/**
 * @swagger
 * /api/v1/notification/list:
 *   get:
 *     tags: [User - Notification]
 *     summary: Fetch notification listing
 *     description: Retrieves notification listing based on the user's ID provided in the token.
 *     parameters:
 *       - in: query
 *         name: notificationId
 *         schema:
 *           type: string
 *         description: Filter by notification ID
 *     responses:
 *       200:
 *         description: Notification listing fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notification listing fetched successfully
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
 *                   example: Error while fetching notification listing
 */


notificationRouter.get('/list',
    celebrate({   
        [Segments.QUERY]: Joi.object().keys({
            notificationId: Joi.string().optional(),
        }),
    }),
    middleware.verifyToken,
    async (req: Request, res: Response, next: NextFunction) => {
        await notificationController.listing(req, res, next);
    })

export { notificationRouter };