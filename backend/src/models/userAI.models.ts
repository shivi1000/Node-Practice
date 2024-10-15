//write down a schema for me of a user using mongoose which will have keys like name, email, password, mobile, countryCode, otp, isOtpVerified, status
import mongoose, { SchemaTypes } from "mongoose";
import { ENUM } from "../common/enum.js";

const UserSchemaAI = new mongoose.Schema({
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

export default mongoose.model("usersAI", UserSchemaAI);
