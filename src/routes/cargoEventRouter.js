import express from "express";
import {TrackingNumberInEvent} from "../controller/cargoEventController.js";
const cargoEventRouter = express.Router();

cargoEventRouter.get("/tracking-number-event" , TrackingNumberInEvent);

export default cargoEventRouter;