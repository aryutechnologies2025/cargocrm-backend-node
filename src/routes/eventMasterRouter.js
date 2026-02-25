import express from "express";
import { createEventMaster,
    getEventMasters,
    editEventMaster,
    deleteEventMaster} from "../controller/eventMasterController.js";

const eventMasterRouter = express.Router();

eventMasterRouter.post("/create-event-masters", createEventMaster);
eventMasterRouter.get("/view-event-masters", getEventMasters);
eventMasterRouter.put("/edit-event-masters/:id", editEventMaster);
eventMasterRouter.delete("/delete-event-masters/:id", deleteEventMaster);

export default eventMasterRouter;