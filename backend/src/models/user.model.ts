import mongoose, { SchemaTypes } from "mongoose";
import { ENUM } from "../common/enum.js";

const UserSchema = new mongoose.Schema({
    name: { type: SchemaTypes.String, required: true, trim: true },
    email: { type: SchemaTypes.String, required: true, unique: true, trim: true },
    countryCode: { type: SchemaTypes.String, required: true, trim: true },
    mobile: { type: SchemaTypes.String, required: true, trim: true },
    profileImage: { type: SchemaTypes.String, trim: true },
    password: { type: SchemaTypes.String, required: true, trim: true },
    otp: { type: SchemaTypes.Number },
    isOtpVerified: { type: SchemaTypes.Boolean },
    status: { type: SchemaTypes.Number, default: ENUM.STATUS.ACTIVE },
},
    {
        timestamps: true
    }
)

export default mongoose.model("users", UserSchema);