import User from '../models/user.model.js';
class UserV1 {

    async createUser(payload: any) {
        const data = await User.create(payload);
        return data ;
    }
    async findOneByQuery(query: any) {
        const data = await User.findOne(query);
        return data;
      }

      async findOneAndUpdateUserByQuery(query: any, payload: any) {
        const data = await User.findOneAndUpdate(query, { $set: payload }, { new: true });
        return data;
      }
}
const userV1 = new UserV1();
export default userV1;