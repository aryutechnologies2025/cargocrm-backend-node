
import express from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,

  deleteUser
} from "../controller/userController.js";

const userRouter = express.Router();

userRouter.post("/create-users",createUser);
userRouter.get("/get-users",getAllUsers);
userRouter.get("/get-users/:id",getUserById);
userRouter.put("/edit-users/:id",updateUser);
userRouter.delete("/delete-users/:id",deleteUser);

export default userRouter;


// import express from "express";
// import {
//   createUser,
//   getAllUsers,
//   getUserById,
//   updateUser,
//   deleteUser
// } from "../controller/userController.js";
// import authorizeRoles from "../middlewares/roleMiddleware.js";
// import useAuth from "../middlewares/authMiddleware.js";



// const userRouter = express.Router();

// // ADMIN ONLY
// userRouter.post(
//   "/create-users",
//   useAuth,
//   authorizeRoles("admin"),
//   createUser
// );


// userRouter.get(
//   "/get-users",
//   useAuth,
//   authorizeRoles("admin"),
//   getAllUsers
// );

// userRouter.get("/get-users/:id", useAuth, getUserById);
// userRouter.put("/edit-users/:id", useAuth, updateUser);
// userRouter.delete(
//   "/delete-users/:id",
//   useAuth,
//   authorizeRoles("admin"),
//   deleteUser
// );

// export default userRouter;
