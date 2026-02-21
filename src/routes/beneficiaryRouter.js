import express from "express";
import useAuth from "../middlewares/authMiddleware.js";
import { 
    addBeneficiary, 
    deleteBeneficiary, 
    editBeneficiary, 
    getBeneficiaries, 
    getBeneficiaryById } from "../controller/beneficiaryController.js";


const beneficiaryRouter = express.Router();

beneficiaryRouter.post("/create-beneficiary", addBeneficiary);
beneficiaryRouter.get("/view-beneficiary", getBeneficiaries);

beneficiaryRouter.get("/view-beneficiary/:id", getBeneficiaryById);
beneficiaryRouter.put("/edit-beneficiary/:id", editBeneficiary);
beneficiaryRouter.delete("/delete-beneficiary/:id", deleteBeneficiary);

export default beneficiaryRouter;