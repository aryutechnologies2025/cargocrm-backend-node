import express from "express";
import useAuth from "../middlewares/authMiddleware.js";
import { createOrder, 
    deleteOrder, 
    editOrder, 
    getOrderById, 
    getOrders } from "../controller/orderController.js";


const orderRouter = express.Router();

orderRouter.post("/create-order", createOrder);
orderRouter.get("/view-orders", getOrders);
orderRouter.get("/view-orders/:id", getOrderById);
orderRouter.put("/edit-order/:id", editOrder);
orderRouter.delete("/delete-order/:id", deleteOrder);

export default orderRouter;