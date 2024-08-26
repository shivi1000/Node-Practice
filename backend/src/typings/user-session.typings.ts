import { ObjectId } from "mongodb";
import { Document } from "mongoose";

interface UserDevice {
    deviceId?: string,
    deviceToken?: string,
}

export interface IUserSession extends Document {
    userId: ObjectId,
    status: number,
    deviceDetails: UserDevice
}