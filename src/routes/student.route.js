import { Router } from "express";
import StudentController from "../controllers/student.controller.js";

const router = Router();
const controller = new StudentController();

router
    .post('/create', controller.createStudent)
    .get('/all', controller.getAllStudents)
    .get('/:id', controller.getStudentById)
    .put('/update/:id', controller.updateStudent)
    .delete('/delete/:id', controller.deleteStudent);

export default router;