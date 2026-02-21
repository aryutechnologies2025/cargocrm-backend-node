import express from "express";
// import { getLoginLogs } from "../controllers/loginLogController.js";

import useAuth from "../middlewares/authMiddleware.js";
import { getLoginLog } from "../controller/loginlogController.js";


const loginLogRouter = express.Router();


loginLogRouter.get("/login-logs", useAuth, getLoginLog);

export default loginLogRouter;
