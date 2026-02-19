import e from "express";
import Beneficiary from "../models/beneficiaryModel.js";
import Customer from "../models/customerModel.js";
import Order from "../models/orderModel.js";
import { handleValidationError } from "./baseController.js";

const generateTrackingNumber = async () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const randomLetters = (length) =>
    Array.from({ length }, () =>
      letters[Math.floor(Math.random() * letters.length)]
    ).join("");

  const randomDigits = (length) =>
    Array.from({ length }, () =>
      Math.floor(Math.random() * 10)
    ).join("");

  let tracking;
  let exists = true;

  while (exists) {
    tracking = `CA${randomDigits(9)}${randomLetters(2)}`;
    exists = await Order.exists({ tracking_number: tracking });
  }

  return tracking;
};


const createOrder = async (req, res) => {
  try {
    const { sender_id, beneficiary_id, cargo_mode, packed, status, created_by } = req.body;

    if (!sender_id || !beneficiary_id) {
      return res.json({ success: false, message: "Sender & Beneficiary required" });
    }

    const sender = await Customer.findById(sender_id);
    if (!sender) {
      return res.json({
        success: false,
        errors: { sender_id: "Invalid sender" }
      });
    }

    const beneficiary = await Beneficiary.findById(beneficiary_id);
    if (!beneficiary) {
      return res.json({
        success: false,
        errors: { beneficiary_id: "Invalid beneficiary" }
      });
    }

    const tracking_number = await generateTrackingNumber();

    const order = await Order.create({
      tracking_number,
      sender_id,
      beneficiary_id,
      cargo_mode,
      packed,
      status,
      created_by
    });

    await order.populate([
      { path: "sender_id", select: "name email phone" },
      { path: "beneficiary_id", select: "name email phone" },
      { path: "created_by", select: "name email" }
    ]);

    res.json({
      success: true,
      message: "Order created successfully",
  
    });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message || "Internal Server Error" });
  }
};


 const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ is_deleted: "0" })
      .populate("sender_id", "name email phone")
      .populate("beneficiary_id", "name email phone")
      .populate("created_by", "name email")
      .sort({ createdAt: -1 });
      
    res.json({ success: true, data: orders });
  } catch (error) {
    res.json({ success: false, message: error.message || "Internal Server Error" });
  }
};

 const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("sender_id", "name email phone address")
      .populate("beneficiary_id", "name email phone address")
      .populate("created_by", "name email");
    
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }
    
    res.json({ success: true, data: order });
  } catch (error) {
    res.json({ success: false, message:  error.message || "Internal Server Error" });
  }
};

 const getOrdersBySender = async (req, res) => {
  try {
    const { senderId } = req.params;
    
    const orders = await Order.find({ 
      sender_id: senderId,
      status: "1" 
    })
      .populate("beneficiary_id", "name email phone")
      .populate("created_by", "name email")
      .sort({ createdAt: -1 });
      
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message:  error.message || "Internal Server Error" });
  }
};

 const getOrdersByBeneficiary = async (req, res) => {
  try {
    const { beneficiaryId } = req.params;
    
    const orders = await Order.find({ 
      beneficiary_id: beneficiaryId,
      status: "active" 
    })
      .populate("sender_id", "name email phone")
      .populate("created_by", "name email")
      .sort({ createdAt: -1 });
      
    res.json({ success: true});
  } catch (error) {
    res.json({ success: false, message:  error.message || "Internal Server Error" });
  }
};

 const editOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    // If updating references, verify they exist
    const { sender_id, beneficiary_id } = req.body;
    
    if (sender_id && sender_id !== order.sender_id.toString()) {
      const sender = await Customer.findOne({ _id: sender_id, status: "1" });
      if (!sender) {
        return res.json({ 
          success: false, 
          errors: { sender_id: "Invalid or inactive sender" } 
        });
      }
    }

    if (beneficiary_id && beneficiary_id !== order.beneficiary_id.toString()) {
      const beneficiary = await Beneficiary.findOne({ _id: beneficiary_id, status: "1" });
      if (!beneficiary) {
        return res.json({ 
          success: false, 
          errors: { beneficiary_id: "Invalid or inactive beneficiary" } 
        });
      }
    }

    const updated = await Order.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    }).populate([
      { path: "sender_id", select: "name email phone" },
      { path: "beneficiary_id", select: "name email phone" },
      { path: "created_by", select: "name email" }
    ]);

    res.json({ 
      success: true, 
      message: "Order updated successfully", 
      
    });
  } catch (error) {
    console.log("error", error);
    const validationError = handleValidationError(error, res);
    if (validationError) return;
    res.json({ success: false, message: error.message || "Internal Server Error" });
  }
};

const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const orderDetails = await Order.findByIdAndUpdate(
      id,
      { is_deleted: 1 },
      { new: true }
    );
    if (!orderDetails) {
      return res.json({ success: false, message: "Order Not Found" });
    }
    res.json({ success: true, message:  "Order deleted successfully" });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
};

export { createOrder, getOrders, getOrderById, getOrdersBySender, getOrdersByBeneficiary, editOrder, deleteOrder };