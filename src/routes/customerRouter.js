import express from "express";
import useAuth from "../middlewares/authMiddleware.js";
import {addCustomers, getCustomer, getAllCustomers, addCustomer, deleteCustomer, editCustomer, getCustomerById, getCustomers ,customerDetailByPhoneNumber} from "../controller/customerController.js";

const customerRouter = express.Router();

customerRouter.post("/create-customers", addCustomer);
customerRouter.get("/view-customers", getCustomers);
customerRouter.get("/view-customers/:id", getCustomerById);
customerRouter.put("/edit-customers/:id", editCustomer);
customerRouter.delete("/delete-customers/:id", deleteCustomer);


customerRouter.post("/create-customerss", addCustomers);
customerRouter.get("/view-customerss", getAllCustomers);
customerRouter.get("/view-customerss/:id", getCustomerById);
customerRouter.get("/customer-detail-by-phone-number/:id", customerDetailByPhoneNumber);


export default customerRouter;