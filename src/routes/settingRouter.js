import express from "express";
import { createSetting, getSetting } from "../controller/settingController.js";
const settingRouter = express.Router();
settingRouter.post("/create-setting", createSetting);
settingRouter.get("/view-setting", getSetting);
export default settingRouter;