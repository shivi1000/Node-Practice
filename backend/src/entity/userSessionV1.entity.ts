import UserSession from '../models/userSession.model.js';

class UserSessionV1 {

    async createUserSession(payload: any) {
        const data = await UserSession.create(payload);
        return data ;
    }
}

export const userSessionV1 = new UserSessionV1();