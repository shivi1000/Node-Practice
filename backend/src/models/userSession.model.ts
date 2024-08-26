import { model, Schema, SchemaTypes } from "mongoose";
import { ENUM } from "../common/enum.js";
import { IUserSession } from "../typings/user-session.typings.js";

const deviceDetails = new Schema({
    deviceId: { type: SchemaTypes.String, trim: true },
    deviceToken: { type: SchemaTypes.String, trim: true },
},{
    _id: false,
    timestamps: false
});


export const UserSessionSchema = new Schema({
    userId: { type: SchemaTypes.ObjectId, required: true, index: true, ref: ENUM.COLLECTION.USER },
    deviceDetails: { type: deviceDetails, trim: true },
    status: {type: SchemaTypes.String, default: ENUM.STATUS.ACTIVE},
    
},
{
    versionKey: false,
    collection: ENUM.COLLECTION.USER_SESSION,
    timestamps: true
}
)

export default model<IUserSession>(ENUM.COLLECTION.USER_SESSION, UserSessionSchema);