import { Document } from "mongoose";

export interface IUser extends Document {
    name:string,
    email: string,
    countryCode: string,
    mobile: string,
    profileImage?: string,
    password: string,
    otp?: number,
    isOtpVerified?: boolean,
    status?: number
}