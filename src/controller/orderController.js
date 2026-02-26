import e from "express";
import Beneficiary from "../models/beneficiaryModel.js";
import Customer from "../models/customerModel.js";
import Order from "../models/orderModel.js";
import { handleValidationError } from "./baseController.js";
import {encryptData } from "../utils/encryption.js";
import Parcel from "../models/parcelModel.js";
import Settings from "../models/settingModel.js";
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
      .populate("beneficiary_id", "_id name")
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

const getParcelByIds = async(req,res)=>{
  const {id} = req.params;
  try{
    const parcel = await Parcel.find({order_id: id})
      .populate({
        path: "order_id",
        select: "sender_id beneficiary_id cargo_mode packed status tracking_number",
        populate: [
          { path: "sender_id", select: "name address" },
          { path: "beneficiary_id", select: "name address" }
        ]
      })
      .populate("created_by", "name email")
    const settingDetails = await Settings.find({});

    
    const formatedParcel = parcel.map((parcel) => ({
      id: parcel._id,
      order_id: parcel.order_id?._id,
      tracking_number: parcel.order_id?.tracking_number,
      sender: {
        id: parcel.order_id?.sender_id?._id,
        name: parcel.order_id?.sender_id?.name,
        address:parcel.order_id?.sender_id?.address
      },
      beneficiary: {
        id: parcel.order_id?.beneficiary_id?._id,
        name: parcel.order_id?.beneficiary_id?.name,
        address:parcel.order_id?.beneficiary_id?.address
      },
      cargo_mode: parcel.order_id?.cargo_mode,
      piece_number: parcel.piece_number,
      piece_details: parcel.piece_details,
      description: parcel.description,
      status: parcel.status,
      created_by: parcel.created_by?.name,
      createdAt: parcel.createdAt,

    }));

    const formatedSetting = settingDetails.map((setting) => ({
      id: setting._id,
      teamAndCondition: setting.teamAndCondition,
    }));

    const responseData = {
      success: true,
      data: formatedParcel,
      settings: formatedSetting
    };

    const encryptedData = encryptData(responseData);
   return res.status(200).json({
      success: true,
      encrypted: true,
      data: encryptedData,
    });
  //  return res.status(200).json({
  //     success: true,
  //     encrypted: true,
  //     data: encryptedData,
  //   });
  }catch(error){
    res.json({ success: false, message: error.message || "Internal Server Error" });
  }
}

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


const addUpdateOrder = async (req, res) => {
  try {
    const { id, customerId, cargo_mode, packed } = req.body;
    console.log("req.body", req.body);

    if (id) {
      const existingOrder = await Order.findById(id);

      // if ( existingOrder) {
      //   return res.status(404).json({
      //     success: false,
      //     message: "Order not found"
      //   });
      // }

    //  existingOrder.tracking_number = tracking_number;
     existingOrder.customerId = customerId;
     existingOrder.cargo_mode = cargo_mode;
     existingOrder.packed = packed;
    

      await existingOrder.save();

      return res.json({
        success: true,
        message: "Order updated successfully",
        data: existingOrder
      });
    }

    const tracking_number = await generateTrackingNumber();

    const order = new Order({
      tracking_number, customerId, cargo_mode, packed
    });

    await order.save();

    return res.json({
      success: true,
      message: "Order added successfully",
      data: order
    });

  } catch (error) {
    console.error("ADD Order ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getNewBeneficiaryId = async (req, res) => {
  try{
    const {id} = req.params;
    const order = await Order.findOne({
      $or: [{ _id: id }, { customerId: id }],
      is_deleted: "0"
    });
    const responseData = {
      success:true,
      data:order
    };
    const encryptedData = encryptData(responseData);
    return res.status(200).json({
      success: true,
      encrypted: true,
      data: encryptedData,
    });
  }catch(error){
    res.status(500).json({ 
      success: false, 
      message: error.message || "Internal Server Error" 
    });
  } 
};


// const allOrder = async (req,res)=>{
//   try{
//     const orders = await Order.find({ is_deleted: "0" }).populate("customerId", "name");
//     const beneficiaryDetails = await Beneficiary.find({ is_deleted: "0" })
//     .populate("customerId", "name");
//     const parcel = await Parcel.find({ is_deleted: "0" });
//     const formattedOrders = orders.map((order) => ({
//       id: order._id,
//       tracking_number: order.tracking_number,
//       customerId: order.customerId?._id,
//       customer:order.customerId?.name,
//       cargo_mode: order.cargo_mode,
//       packed: order.packed
//     }));
//     const formattedbeneficiaryDetails = beneficiaryDetails.map((beneficiary) => ({
//       id: beneficiary._id,
//       name: beneficiary?.name,
//       customerId: beneficiary.customerId?.name,
//       beneficiary_id: beneficiary.beneficiary_id,
//       email: beneficiary.email,
//       phone: beneficiary.phone,
//       city:beneficiary.city,
//       country:beneficiary.country,
//       address:beneficiary.address
//     }));

//     const formattedParcel = parcel.map((parcel) => ({
//       id: parcel._id,
//       customerId: parcel.customerId,
//       piece_number: parcel.piece_number,
//       piece_details: parcel.piece_details,
//       description:parcel.description
//     }));

//     const responseData = {
//       success: true,
//       data: formattedOrders,
//       beneficiaryDetails: formattedbeneficiaryDetails,
//       parcel:formattedParcel
//     };
//     const encryptedData = encryptData(responseData);
//     return res.status(200).json({
//       success: true,
//       encrypted: true,
//       data: encryptedData,
//     });
//   }catch(error){
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || "Internal Server Error" 
//     });
//   }
// }


const allOrder = async (req, res) => {
  try {
    const orders = await Order.find({ is_deleted: "0" })
      .populate("customerId", "name");

    const beneficiaryDetails = await Beneficiary.find({ is_deleted: "0" })
      .populate("customerId", "name");

    const parcel = await Parcel.find({ is_deleted: "0" });

    // Create grouped object
    const groupedData = {};

    // Helper function to initialize customer group
    const initCustomer = (customerId, customerName = null) => {
      if (!groupedData[customerId]) {
        groupedData[customerId] = {
          customerId,
          customerName,
          orders: [],
          beneficiaries: [],
          parcels: []
        };
      }
    };

    // Group Orders
    orders.forEach((order) => {
      const customerId = order.customerId?._id?.toString();
      if (!customerId) return;

      initCustomer(customerId, order.customerId?.name);

      groupedData[customerId].orders.push({
        id: order._id,
        tracking_number: order.tracking_number,
        cargo_mode: order.cargo_mode,
        packed: order.packed,
        createdAt: order.createdAt
      });
    });

    // Group Beneficiaries
    beneficiaryDetails.forEach((beneficiary) => {
      const customerId = beneficiary.customerId?._id?.toString();
      if (!customerId) return;

      initCustomer(customerId, beneficiary.customerId?.name);

      groupedData[customerId].beneficiaries.push({
        id: beneficiary._id,
        name: beneficiary.name,
        beneficiary_id: beneficiary.beneficiary_id,
        email: beneficiary.email,
        phone: beneficiary.phone,
        city: beneficiary.city,
        country: beneficiary.country,
        address: beneficiary.address
      });
    });

    // Group Parcels
    parcel.forEach((p) => {
      const customerId = p.customerId?.toString();
      if (!customerId) return;

      initCustomer(customerId);

      groupedData[customerId].parcels.push({
        id: p._id,
        piece_number: p.piece_number,
        piece_details: p.piece_details,
        description: p.description
      });
    });

    const responseData = {
      success: true,
      data: Object.values(groupedData)
    };

    const encryptedData = encryptData(responseData);

    return res.status(200).json({
      success: true,
      encrypted: true,
      data: encryptedData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error"
    });
  }
};

    

export {addUpdateOrder,getNewBeneficiaryId,allOrder,getParcelByIds, createOrder,getSenderByBeneficiary, getOrders, getOrderById, getOrdersBySender, getOrdersByBeneficiary, editOrder, deleteOrder };