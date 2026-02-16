import express from "express";


import { addEvent, deleteEvent, editEvent, getEventById, getEvents, getEventsByDateRange, getEventsByRunNumber, getEventsByTrackingNumber, getEventStats } from "../controller/eventController.js";
import useAuth from "../middlewares/authMiddleware.js";

const eventRouter = express.Router();

// All routes are protected with authentication
// eventRouter.use(useAuth);


eventRouter.post("/create-event" , addEvent);
eventRouter.get("/view-events" , getEvents);
eventRouter.get("/view-event/:id" , getEventById);
eventRouter.put("/edit-event/:id" , editEvent);
eventRouter.delete("/delete-event/:id" , deleteEvent);

// Additional query routes
eventRouter.get("/by-run/:runNumber", getEventsByRunNumber);
eventRouter.get("/by-date-range", getEventsByDateRange);
eventRouter.get("/by-tracking/:trackingNumber", getEventsByTrackingNumber);
eventRouter.get("/statistics", getEventStats);

export default eventRouter;