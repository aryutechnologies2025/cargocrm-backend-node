import express from "express";

import { forgotPassword, loginUser, logoutUser, registerUser, resetPassword } from "../controller/authController.js";
import protect from "../middlewares/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/login", loginUser);
authRouter.post("/register", registerUser);
authRouter.post("/logout", logoutUser);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:token", resetPassword);


export default authRouter;
