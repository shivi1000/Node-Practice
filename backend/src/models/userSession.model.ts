import mongoose, { Schema, SchemaTypes } from "mongoose";
import { ENUM } from "../common/enum.js";

const deviceDetails = new Schema({
    deviceId: { type: SchemaTypes.String, trim: true },
    deviceToken: { type: SchemaTypes.String, trim: true },
}, {
    _id: false,
    timestamps: false
});


const UserSessionSchema = new mongoose.Schema({
    userId: { type: SchemaTypes.ObjectId, required: true, index: true, ref: ENUM.COLLECTION.USER },
    deviceDetails: { type: deviceDetails, trim: true },
    status: { type: SchemaTypes.Number, default: ENUM.STATUS.ACTIVE },
    lastRecentActivity: { type: SchemaTypes.Date, default: new Date()}

},
    {
        timestamps: true
    }
)

export default mongoose.model("user_session", UserSessionSchema);