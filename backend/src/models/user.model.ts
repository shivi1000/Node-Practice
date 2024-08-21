import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    mobile: String,
    password: String,
    status: Number,
})

const User = mongoose.model('User', UserSchema);

export { User }