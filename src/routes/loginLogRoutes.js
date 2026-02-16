import express from "express";
// import { getLoginLogs } from "../controllers/loginLogController.js";
import protect from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";
import getLoginLogs from "../controller/loginlogController.js";


const loginLogRouter = express.Router();

// Admin can view all login logs
loginLogRouter.get(
  "/",
  protect,
  authorizeRoles("admin"),
getLoginLogs
);

export default loginLogRouter;
