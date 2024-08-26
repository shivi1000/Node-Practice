import { model, Schema, SchemaTypes } from "mongoose";
import { ENUM } from "../common/enum.js";
import { IUser } from "../typings/user.typings.js";

export const UserSchema = new Schema({
    name: {type: SchemaTypes.String, required: true, trim: true},
    email: {type: SchemaTypes.String, required: true, unique: true, trim: true},
    countryCode: {type: SchemaTypes.String, required: true, trim: true},
    mobile: {type: SchemaTypes.String, required: true, trim: true},
    password: {type: SchemaTypes.String, required: true, trim: true},
    otp: {type: SchemaTypes.Number},
    isOtpVerified: {type: SchemaTypes.Boolean},
    status: {type: SchemaTypes.String, default: ENUM.STATUS.ACTIVE},
},
{
    versionKey: false,
    collection: ENUM.COLLECTION.USER,
    timestamps: true
}
)

export default model<IUser>(ENUM.COLLECTION.USER, UserSchema);