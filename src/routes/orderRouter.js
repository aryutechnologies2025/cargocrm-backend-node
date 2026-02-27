import express from "express";
import useAuth from "../middlewares/authMiddleware.js";
import { createOrder, getParcelByIds,
    deleteOrder, 
    editOrder, 
    getOrderById, 
    getSenderByBeneficiary,
    addUpdateOrder,getNewBeneficiaryId,
    getOrders,allOrder,getPieceAndWeightInParcel } from "../controller/orderController.js";


const orderRouter = express.Router();

orderRouter.post("/create-orders", createOrder);
orderRouter.get("/view-orders", getOrders);
orderRouter.get("/get-sender-by-beneficiary", getSenderByBeneficiary);
orderRouter.get("/view-orders/:id", getOrderById);
orderRouter.get("/view-parcel/:id", getParcelByIds);
orderRouter.put("/edit-orders/:id", editOrder);
orderRouter.delete("/delete-orders/:id", deleteOrder);


orderRouter.post("/add-update-order", addUpdateOrder);
orderRouter.get("/get-new-beneficiary-id/:id", getNewBeneficiaryId);
orderRouter.get("/all-order", allOrder);
orderRouter.get("/get-piece-and-weight-in-parcel", getPieceAndWeightInParcel);
export default orderRouter;