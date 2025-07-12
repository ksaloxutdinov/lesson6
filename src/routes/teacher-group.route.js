import { Router } from "express";
import TeacherGroupController from "../controllers/teacher-group.controller.js";

const router = Router();
const controller = new TeacherGroupController();

router
    .post('/create', controller.createTG)
    .get('/all', controller.getAllTG)
    .get('/:id', controller.getTGById)
    .put('/update/:id', controller.updateTG)
    .delete('/delete/:id', controller.deleteTG);

export default router;