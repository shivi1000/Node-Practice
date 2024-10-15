import express, { Request, Response, NextFunction } from 'express';
import { middleware } from '../middleware/auth.middleware.js';
import { celebrate, Joi, Segments } from 'celebrate'; 
import { userAIController } from '../controller/userAI.controller.js';
const router = express.Router();

router.post('/signup',
    celebrate({   
        [Segments.BODY]: Joi.object().keys({
            name: Joi.string().max(15).required(),
            email: Joi.string().required().email(),
            countryCode: Joi.string().required(),
            mobile: Joi.string().required(),
            password: Joi.string().required(),
        }),
    }),
    middleware.authentication,
    async (req: Request, res: Response, next: NextFunction) => {
        await userAIController.signup(req, res, next);
    })

export { router }