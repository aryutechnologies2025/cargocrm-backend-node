import express from "express";
import { addRole, deleteRole, editRole, getRole, getRoleById } from "../controller/roleController.js";

const roleRouter = express.Router();

roleRouter.post("/create-roles", addRole);
roleRouter.get("/view-roles", getRole);
roleRouter.get("/view-roles/:id", getRoleById);  //open edit model 
roleRouter.put("/edit-roles/:id", editRole); 
roleRouter.delete("/delete-roles/:id", deleteRole); 

export default roleRouter;
