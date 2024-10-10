import mongoose, { Schema, SchemaTypes } from "mongoose";

const SenderDetails = new Schema({
    id: { type: SchemaTypes.String, required: true, trim: true },
    name: { type: SchemaTypes.String, required: true, trim: true },
}, {
    _id: false,
    timestamps: false
});

const ReceiverDetails = new Schema({
    id: { type: SchemaTypes.String, required: true, trim: true },
    name: { type: SchemaTypes.String, required: true, trim: true }
}, {
    _id: false,
    timestamps: false
});

const NotificationSchema = new mongoose.Schema({
    title: { type: SchemaTypes.String, required: true, trim: true },
    description: { type: SchemaTypes.String, required: true, trim: true },
    imageUrl: { type: SchemaTypes.String, required: true, trim: true },
    status: { type: SchemaTypes.Number, required: true },
    sender: { type: SenderDetails, required: true, trim: true },
    receiver: { type: ReceiverDetails, required: true, trim: true },
},
    {
        timestamps: true
    }
)

export default mongoose.model("notification", NotificationSchema);