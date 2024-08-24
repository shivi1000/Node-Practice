import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    countryCode: String,
    mobile: String,
    password: String,
    otp: Number,
    isOtpVerified: Boolean,
    status: Number,
    
})

const User = mongoose.model('User', UserSchema);

export { User }