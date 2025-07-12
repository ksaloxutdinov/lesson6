import { Router } from "express";
import GroupController from "../controllers/group.controller.js";

const router =  Router();
const controller = new GroupController();

router
    .post('/create', controller.createGroup)
    .get('/all', controller.getAllGroups)
    .get('/:id', controller.getGroupById)
    .put('/update/:id', controller.updateGroup)
    .delete('/delete/:id', controller.deleteGroup);

export default router;