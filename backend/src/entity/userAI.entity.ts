import UserAI from '../models/userAI.models.js';

class UserAIEntity {
  async userExistsByMobile(mobile: string) {
    const user = await UserAI.findOne({ mobile });
    return user;
  }

  async createUser(payload: any) {
    const user = await UserAI.create(payload);
    return user;
  }

}

const userAIV1 = new UserAIEntity();
export default userAIV1;