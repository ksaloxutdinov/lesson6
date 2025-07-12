import { Router } from "express";
import TeacherController from "../controllers/teacher.controller.js";

const router = Router();
const controller = new TeacherController();

router
    .post('/create', controller.createTeacher)
    .get('/all', controller.getAllTeachers)
    .get('/:id', controller.getTeacherById)
    .put('/update/:id', controller.updateTeacher)
    .delete('/delete/:id', controller.deleteTeacher);

export default router;