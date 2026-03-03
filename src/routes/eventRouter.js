import express from "express";


import {TrackingNumberInEvent, addEvent, deleteEvent, editEvent, getEventById, getEvents } from "../controller/eventController.js";
import useAuth from "../middlewares/authMiddleware.js";

const eventRouter = express.Router();

// All routes are protected with authentication
// eventRouter.use(useAuth);


eventRouter.post("/create-events" , addEvent);
eventRouter.get("/view-events" , getEvents);
eventRouter.get("/view-events/:id" , getEventById);
eventRouter.put("/edit-events/:id" , editEvent);
eventRouter.delete("/delete-events/:id" , deleteEvent);
eventRouter.get("/tracking-number-event" , TrackingNumberInEvent);



export default eventRouter;