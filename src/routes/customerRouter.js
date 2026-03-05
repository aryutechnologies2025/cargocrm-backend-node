import express from "express";
import useAuth from "../middlewares/authMiddleware.js";
import {getCustomerDetails,getCustomerName,getBeneficiaryDetails, getBeneficiaryName, addCustomer, deleteCustomer, editCustomer, getCustomerById, getCustomers} from "../controller/customerController.js";

const customerRouter = express.Router();

customerRouter.post("/create-customers", addCustomer);
customerRouter.get("/view-customers", getCustomers);
customerRouter.get("/view-customers/:id", getCustomerById);
customerRouter.put("/edit-customers/:id", editCustomer);
customerRouter.delete("/delete-customers/:id", deleteCustomer);




customerRouter.get("/get-customer-name", getCustomerName);
customerRouter.get("/get-beneficiary-name", getBeneficiaryName);
customerRouter.get("/get-beneficiary-details", getBeneficiaryDetails);
customerRouter.get("/get-customer-details", getCustomerDetails);

export default customerRouter;