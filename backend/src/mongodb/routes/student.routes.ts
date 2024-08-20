import express from "express"
const router = express.Router();
import { Student } from "../models/student.models.js";

router.get('/getAllStudents', async (req, res) => {
    try{
        const data = await Student.find({});
        console.log("Students retrieved >>>>>>>>>>>>>>>>");
        res.status(200).json(data);
    } catch ( error ) {
        console.log("Error while retrieving students >>>>>>>>>>>", error);
    }
})

router.post('/addStudents', async (req, res) => {
    try{
        const data = await Student.create(req.body);
        console.log("Students added >>>>>>>>>>>>>>>>");
        res.status(200).json(data);
    } catch ( error ) {
        console.log("Error while adding students >>>>>>>>>>>", error);
    }
})

router.get('/:id', async (req, res) => {
    try{
        const data = await Student.findById(req.params.id);
        console.log("Students retrieved by id >>>>>>>>>>>>>>>>");
        res.status(200).json(data);
    } catch ( error ) {
        console.log("Error while retrieving students by id >>>>>>>>>>>", error);
    }
})

export { router };