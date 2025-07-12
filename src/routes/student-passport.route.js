import { Router } from "express";
import StudentPassportController from "../controllers/student-passpost.controller.js";

const router = Router();
const controller = new StudentPassportController();

router
    .post('/create', controller.createPassport)
    .get('/all', controller.getAllPassports)
    .get('/:id', controller.getPassportById)
    .put('/update/:id', controller.updatePassport)

export default router;