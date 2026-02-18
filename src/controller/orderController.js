import Beneficiary from "../models/beneficiaryModel.js";
import Customer from "../models/customerModel.js";
import Order from "../models/orderModel.js";
import { handleValidationError } from "./baseController.js";


 const createOrder = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.json({ success: false, message: "Data is required" });
    }

    const { sender_id, beneficiary_id, cargo_mode, packed, status,created_by } = req.body;

    // Verify sender exists and is active
    const sender = await Customer.findOne({ _id: sender_id, status: "active" });
    if (!sender) {
      return res.json({ 
        success: false, 
        errors: { sender_id: "Invalid or inactive sender" } 
      });
    }

    // Verify beneficiary exists and is active
    const beneficiary = await Beneficiary.findOne({ _id: beneficiary_id, status: "active" });
    if (!beneficiary) {
      return res.json({ 
        success: false, 
        errors: { beneficiary_id: "Invalid or inactive beneficiary" } 
      });
    }

    const order = new Order({
      sender_id,
      beneficiary_id,
      cargo_mode,
      packed,
      status,
      created_by
    });

    await order.save();
    
    // Populate references for response
    await order.populate([
      { path: "sender_id", select: "name email phone" },
      { path: "beneficiary_id", select: "name email phone" },
    { path: "created_by", select: "name email" }
    ]);

    res.json({ 
      success: true, 
      message: "Order added successfully", 

    });

  } catch (error) {
    console.log("error", error);
    const validationError = handleValidationError(error, res);
    if (validationError) return;
    res.json({ success: false, message: "Internal Server Error" });
  }
};

 const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: "active" })
      .populate("sender_id", "name email phone")
      .populate("beneficiary_id", "name email phone")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
      
    res.json({ success: true, data: orders });
  } catch (error) {
    res.json({ success: false, message: "Internal Server Error" });
  }
};

 const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("sender_id", "name email phone address")
      .populate("beneficiary_id", "name email phone address")
      .populate("createdBy", "name email");
    
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }
    
    res.json({ success: true, data: order });
  } catch (error) {
    res.json({ success: false, message: "Internal Server Error" });
  }
};

 const getOrdersBySender = async (req, res) => {
  try {
    const { senderId } = req.params;
    
    const orders = await Order.find({ 
      sender_id: senderId,
      status: "active" 
    })
      .populate("beneficiary_id", "name email phone")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
      
    res.json({ success: true, data: orders });
  } catch (error) {
    res.json({ success: false, message: "Internal Server Error" });
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
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
      
    res.json({ success: true, data: orders });
  } catch (error) {
    res.json({ success: false, message: "Internal Server Error" });
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
      const sender = await Customer.findOne({ _id: sender_id, status: "active" });
      if (!sender) {
        return res.json({ 
          success: false, 
          errors: { sender_id: "Invalid or inactive sender" } 
        });
      }
    }

    if (beneficiary_id && beneficiary_id !== order.beneficiary_id.toString()) {
      const beneficiary = await Beneficiary.findOne({ _id: beneficiary_id, status: "active" });
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
      { path: "createdBy", select: "name email" }
    ]);

    res.json({ 
      success: true, 
      message: "Order updated successfully", 
      
    });
  } catch (error) {
    console.log("error", error);
    const validationError = handleValidationError(error, res);
    if (validationError) return;
    res.json({ success: false, message: "Internal Server Error" });
  }
};

 const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    order.status = "inactive";
    await order.save();

    res.json({ success: true, message: "Order deactivated successfully" });
  } catch (error) {
    res.json({ success: false, message: "Internal Server Error" });
  }
};

export { createOrder, getOrders, getOrderById, getOrdersBySender, getOrdersByBeneficiary, editOrder, deleteOrder };