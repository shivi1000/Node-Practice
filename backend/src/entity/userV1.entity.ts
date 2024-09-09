import { ENUM } from '../common/enum.js';
import User from '../models/user.model.js';


class UserV1 {

    async userExistsByEmail(payload: any) {
        const data = await User.findOne({ email: payload.email });
        return data ;
    }

    async userExistsByMobile(mobile: any) {
        const data = await User.findOne({ mobile: mobile });
        return data ;
    }

    async createUser(payload: any) {
        const data = await User.create(payload);
        return data ;
    }

    async updateUserDetails(mobile: string, payload: any) {
        const data = await User.findOneAndUpdate({ mobile: mobile }, { $set: payload }, { new: true });
        return data ;
    }

    async findUserById(payload: any) {
        const data = await User.findOne({ _id: payload.id });
        return data ;
    }

    async findUser(payload: any) {
        const data = await User.findOne({ password: payload.newPassword });
        return data ;
    }

    async updatePassword(payload: any, hashedPassword: string) {
        const data = await User.findOneAndUpdate({ _id: payload.id}, { $set: {password: hashedPassword} }, { new: true });
        return data ;
    }

    async changePassword(payload: any, hashedPassword: any) {
        const data = await User.findOneAndUpdate({ _id: payload.userId}, { $set: {password: hashedPassword} }, { new: true });
        return data ;
    }

    async updateUser(payload: any) {
        const data = await User.findOneAndUpdate({ _id: payload.userId}, { $set: {status: ENUM.STATUS.INACTIVE} }, { new: true });
        return data ;
    }

    async findUserDetails(payload: any) {
        const data = await User.findOne({ _id: payload.userId });
        return data ;
    }
}
const userV1 = new UserV1();
export default userV1;