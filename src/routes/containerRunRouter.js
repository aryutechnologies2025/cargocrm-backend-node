import express from "express";
import useAuth from "../middlewares/authMiddleware.js";
import { addContainerRun, deleteContainerRun, editContainerRun, getContainerRunById, getContainerRuns } from "../controller/containerRunController.js";

const containerRunRouter = express.Router();

containerRunRouter.post("/create-containerruns", addContainerRun);
containerRunRouter.get("/view-containerruns", getContainerRuns);
containerRunRouter.get("/view-containerruns/:id", getContainerRunById);
containerRunRouter.put("/edit-containerruns/:id", editContainerRun);
containerRunRouter.delete("/delete-containerruns/:id", deleteContainerRun);

export default containerRunRouter;