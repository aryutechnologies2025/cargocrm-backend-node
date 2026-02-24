import e from "express";
import Beneficiary from "../models/beneficiaryModel.js";
import Customer from "../models/customerModel.js";
import Order from "../models/orderModel.js";
import { handleValidationError } from "./baseController.js";
import {encryptData } from "../utils/encryption.js";
// import Beneficiary from "../models/beneficiaryModel.js";

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

    // const beneficiary = await Beneficiary.findById(beneficiary_id);
    // if (!beneficiary) {
    //   return res.json({
    //     success: false,
    //     errors: { beneficiary_id: "Invalid beneficiary" }
    //   });
    // }

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
      .populate("beneficiary_id", "name")
      .populate("created_by", "name email")
      .sort({ createdAt: -1 });
      console.log("orders",orders);
    const customerDetails = await Customer.find({ is_deleted: "0" });
    const formattedOrders = orders.map((order) => ({
      id: order._id,
      tracking_number: order.tracking_number,
      sender_id: order.sender_id?.name,
      beneficiary_id: order.beneficiary_id?.name,
      cargo_mode: order.cargo_mode,
      packed: order.packed,
      status: order.status,
      created_by: order?.created_by?.name,
      createdAt: order.createdAt
    }));
    console.log("formattedOrders",formattedOrders);
    const formattedCustomers = customerDetails.map((customer) => ({
      id: customer._id,
      name: customer?.name,
    }));
    const responseData = {
      success: true,
      data: formattedOrders,
      customer: formattedCustomers,
    };

    // const encodedData = Buffer.from(
    //   JSON.stringify(responseData)
    // ).toString("base64");
    const encryptedData = encryptData(responseData);

    return res.status(200).json({
      success: true,
      encrypted: true,
      data: encryptedData,
    });
    // return res.status(200).json({ success: true, data: formattedOrders });
  } catch (error) {
    res.json({ success: false, message: error.message || "Internal Server Error" });
  }
};

const getSenderByBeneficiary = async (req, res) => {
  const {customerId} = req.query;
  try{
    const BeneficiaryDetails = await Beneficiary.find({customerId: customerId})
    .populate("customerId", "name email phone");

    console.log("BeneficiaryDetails",BeneficiaryDetails);
    if(!BeneficiaryDetails){
      return res.json({ success: false, message: "Beneficiary not found" });
    }
    // const responseData = {
    //   success: true,
    //   data: Beneficiary,
    // };

    // const encodedData = Buffer.from(
    //   JSON.stringify(responseData)
    // ).toString("base64");

    // return res.status(200).json({
    //   success: true,
    //   encoded: true,
    //   data: encodedData,
    // });
  const responseData = {
      success: true,
      data: BeneficiaryDetails,
      
    };
    const encryptedData = encryptData(responseData);

    return res.status(200).json({
      success: true,
      encrypted: true,
      data: encryptedData,
    });

    // return res.status(200).json({ success: true, data: BeneficiaryDetails });
  }catch(error){
    res.json({ success: false, message: error.message || "Internal Server Error" });
  }
}

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

export { createOrder,getSenderByBeneficiary, getOrders, getOrderById, getOrdersBySender, getOrdersByBeneficiary, editOrder, deleteOrder };