import express from "express";
import useAuth from "../middlewares/authMiddleware.js";
import { addCustomer, deleteCustomer, editCustomer, getCustomerById, getCustomers } from "../controller/customerController.js";

const customerRouter = express.Router();

customerRouter.post("/create-customers", addCustomer);
customerRouter.get("/view-customers", getCustomers);
customerRouter.get("/view-customers/:id", getCustomerById);
customerRouter.put("/edit-customers/:id", editCustomer);
customerRouter.delete("/delete-customers/:id", deleteCustomer);

export default customerRouter;