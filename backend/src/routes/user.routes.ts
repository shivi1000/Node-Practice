import express, { Request, Response, NextFunction } from 'express';
import { middleware } from '../middleware/auth.middleware.js';
import { userController } from '../controller/user.controller.js';
import { celebrate, Joi, Segments } from 'celebrate'; 
import { CONST } from '../common/const.js';
//Segments is a set of named constants (enum), that can be used to identify the different parts of a request like BODY, QUERY. HEADERS, PARAMS
const router = express.Router();

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


router.post('/signup',
    celebrate({   
        [Segments.BODY]: Joi.object().keys({
            name: Joi.string().max(15).required(),
            email: Joi.string().required().email(),
            countryCode: Joi.string().required(),
            mobile: Joi.string().required(),
            password: Joi.string().required(),
            //status: Joi.number().valid(...Object.values(ENUM.STATUS)).required(),
            //password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
        }),
    }),
    middleware.authentication,
    async (req: Request, res: Response, next: NextFunction) => {
        await userController.signup(req, res, next);
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

router.post('/verify-otp',
    celebrate({   
        [Segments.BODY]: Joi.object().keys({
            countryCode: Joi.string().required(),
            mobile: Joi.string().required(),
            otp: Joi.string().min(6).max(6).required(),
        }),
        [Segments.QUERY]: Joi.object().keys({
            deviceId: Joi.string().required(),
            deviceToken: Joi.string().required(),
        }),
    }),
    middleware.authentication,
    async (req: Request, res: Response, next: NextFunction) => {
        await userController.verifyOtp(req, res, next);
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


router.post('/login',
    celebrate({   
        [Segments.BODY]: Joi.object().keys({
            email: Joi.string().required().email(),
            password: Joi.string().required(),
        }),
        [Segments.QUERY]: Joi.object().keys({
            deviceId: Joi.string().required(),
            deviceToken: Joi.string().required(),
        }),
    }),
    middleware.authentication,
    async (req: Request, res: Response, next: NextFunction) => {
        await userController.login(req, res, next);
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


router.post('/forgotPassword',
    celebrate({   
        [Segments.BODY]: Joi.object().keys({
            email: Joi.string().required().email(),
        }),
    }),
    middleware.authentication,
    async (req: Request, res: Response, next: NextFunction) => {
        await userController.forgotPassword(req, res, next);
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


router.post('/resetPassword',
    celebrate({   
        [Segments.BODY]: Joi.object().keys({
            id:  Joi.string().regex(CONST.MONGODB_OBJECTID_REGEX).required(),
            newPassword: Joi.string().required(),
            confirmPassword: Joi.string().required(),
        }),
    }),
    middleware.authentication,
    async (req: Request, res: Response, next: NextFunction) => {
        await userController.resetPassword(req, res, next);
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


router.post('/changePassword',
    celebrate({ 
        [Segments.BODY]: Joi.object().keys({
            newPassword: Joi.string().required(),
            confirmPassword: Joi.string().required(),
        }),
    }),
    middleware.verifyToken,
    async (req: Request, res: Response, next: NextFunction) => {
        await userController.changePassword(req, res, next);
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


router.get('/details',
    middleware.verifyToken,
    async (req: Request, res: Response, next: NextFunction) => {
        await userController.details(req, res, next);
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

router.put('/completeProfile',
    middleware.verifyToken,
    //upload.single('profileImage'),
    async (req: Request, res: Response, next: NextFunction) => {
        await userController.completeProfile(req, res, next);
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


router.post('/logout',
    middleware.verifyToken,
    async (req: Request, res: Response, next: NextFunction) => {
        await userController.logout(req, res, next);
    })

export { router };

