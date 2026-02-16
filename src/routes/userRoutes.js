
import express from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,

  deleteUser
} from "../controller/userController.js";

// import useAuth from "../middlewares/authMiddleware.js";

// import authorizeRoles from "../middlewares/authorizeRoles.js";


const userRouter = express.Router();

// ADMIN only
// router.post("/create", useAuth, authorizeRoles("admin"), createUser);
// router.get("/", useAuth, authorizeRoles("admin"), getAllUsers);
// router.put("/:id", useAuth, authorizeRoles("admin"), updateUser);
// router.patch("/:id/deactivate", useAuth, authorizeRoles("admin"), deactivateUser);

userRouter.post("/create-users",createUser);
userRouter.get("/get-users",getAllUsers);
userRouter.get("/get-users/:id",getUserById);
userRouter.put("/edit-users/:id",updateUser);
userRouter.delete("/delete-users/:id",deleteUser);

export default userRouter;
