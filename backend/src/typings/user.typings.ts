import { Document } from "mongoose";

export interface IUser extends Document {
    name:string,
    email: string,
    countryCode: string,
    mobile: string,
    password: string,
    otp?: number,
    isOtpVerified?: boolean,
    status?: number
}