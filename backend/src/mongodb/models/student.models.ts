import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
    name: String,
    school: String,
    grade: Number
})

const Student = mongoose.model('Student', StudentSchema);

export { Student }