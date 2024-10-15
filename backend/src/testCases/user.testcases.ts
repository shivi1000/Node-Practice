import { Request, Response, NextFunction } from 'express';
import UserAI from '../models/userAI.models.js';
import { userAIController } from '../controller/userAI.controller.js';
import userAIV1 from '../entity/userAI.entity.js';
import bcrypt from 'bcrypt';

jest.mock('bcrypt');
jest.mock('./userAI.entity');

describe('UserAIController', () => {
    let req: Request;
    let res: Response;
    let next: NextFunction;
    let userAIController;

    beforeEach(() => {
        req = { body: { name: 'Test User', email: 'test@example.com', countryCode: '+1', mobile: '1234567890', password: 'password123' } } as Request;
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
        next = jest.fn();
        userAIController = new UserAIController();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a new user successfully', async () => {
        userAIV1.userExistsByMobile.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue('hashedPassword');
        userAIV1.createUser.mockResolvedValue({ _id: '1234567890' } as UserAI);

        await userAIController.signup(req, res, next);

        expect(userAIV1.userExistsByMobile).toHaveBeenCalledWith('1234567890');
        expect(bcrypt.hash).toHaveBeenCalledWith('password123', CONST.saltRounds);
        expect(userAIV1.createUser).toHaveBeenCalledWith({
            name: 'Test User',
            email: 'test@example.com',
            countryCode: '+1',
            mobile: '1234567890',
            password: 'hashedPassword'
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: 'User created successfully', data: { _id: '1234567890' } });
    });

    it('should return 409 if user already exists', async () => {
        userAIV1.userExistsByMobile.mockResolvedValue({ _id: '1234567890' } as UserAI);

        await userAIController.signup(req, res, next);

        expect(userAIV1.userExistsByMobile).toHaveBeenCalledWith('1234567890');
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ message: 'User already exists with this mobile number' });
    });

    it('should call next with error if there is an error', async () => {
        userAIV1.userExistsByMobile.mockRejectedValue(new Error('Database error'));

        await userAIController.signup(req, res, next);

        expect(userAIV1.userExistsByMobile).toHaveBeenCalledWith('1234567890');
        expect(next).toHaveBeenCalledWith(new Error('Database error'));
    });
});