import express from "express";
import useAuth from "../middlewares/authMiddleware.js";
import { addContainerRun, deleteContainerRun, editContainerRun, getContainerRunById, getContainerRuns } from "../controller/containerRunController.js";

const containerRunRouter = express.Router();

containerRunRouter.post("/create-containerRun", addContainerRun);
containerRunRouter.get("/view-containerRuns", getContainerRuns);
containerRunRouter.get("/view-containerRuns/:id", getContainerRunById);
containerRunRouter.put("/edit-containerRun/:id", editContainerRun);
containerRunRouter.delete("/delete-containerRun/:id", deleteContainerRun);

export default containerRunRouter;