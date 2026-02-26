import e from "express";
import Order from "../models/orderModel.js";
import Parcel from "../models/parcelModel.js";
import { handleValidationError } from "./baseController.js";
import { encryptData } from "../utils/encryption.js";


 const addParcel = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.json({ success: false, message: "Data is required" });
    }

    const { order_id, piece_number, piece_details, description, status, created_by } = req.body;

    
    const parcels = new Parcel({
      order_id,
      piece_number,
      piece_details,
      description: description || "",
      status,
      created_by
    });

    await parcels.save();

    res.json({ 
      success: true, 
      message: "Parcel added successfully", 
 
    });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message || "Internal Server Error" });
  }
};

 const getParcels = async (req, res) => {
  try {
    const parcels = await Parcel.find({is_deleted: 0})
      .populate("order_id", "tracking_number cargoMode packed sender_id beneficiary_id")
      .populate("created_by", "name email")
      .sort({ createdAt: -1 });
    const Orders = await Order.find();
    const formattedParcels = parcels.map((parcel) => ({
      id: parcel._id,
      order_id: parcel.order_id,
      tracking_number: parcel.order_id?.tracking_number,
      piece_number: parcel.piece_number,
      piece_details: parcel.piece_details,
      description:parcel.description,
      status: parcel.status,
      created_by: parcel?.created_by?.name,
      createdAt: parcel.createdAt
    }));
    const formattedOrders = Orders.map((order) => ({
      id: order._id,
      tracking_number: order.tracking_number,

    }))
    const responseData = {
      success: true,
      data: formattedParcels,
      orders: formattedOrders
    };
    const encryptedData = encryptData(responseData);
    res.json({ success: true, encrypted: true, data: encryptedData });
      
    // res.json({ success: true, data: parcels });
  } catch (error) {
    res.json({ success: false, message: error.message || "Internal Server Error" });
  }
};

 const getParcelById = async (req, res) => {
  try {
    const parcel = await Parcel.findById(req.params.id)
      .populate({
        path: "order_id",
        populate: [
          { path: "sender_id", select: "name email phone" },
          { path: "beneficiary_id", select: "name email phone" }
        ]
      })
      .populate("created_by", "name email");
    
    if (!parcel) {
      return res.json({ success: false, message: "Parcel not found" });
    }
    
    res.json({ success: true, data: parcel });
  } catch (error) {
    res.json({ success: false, message: error.message || "Internal Server Error" });
  }
};

 const getParcelsByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const parcels = await Parcel.find({ 
      order_id: orderId,
      status: "1" 
    })
      .populate("createdBy", "name email")
      .sort({ placeNumber: 1 });
      
    res.json({ success: true, data: parcels });
  } catch (error) {
    res.json({ success: false, message: error.message || "Internal Server Error" });
  }
};

const getTrakingDetailById = async (req, res) => {
  const {tracking_number} = req.query;
  try {
    const parcel = await Order.findById(tracking_number);
    if (!parcel) {
      return res.json({ success: false, message: "Parcel not found" });
    }
    const trackingDetails = await Order.find({tracking_number: parcel.tracking_number})
    .populate("sender_id", "name ")
    .populate("beneficiary_id", "name");
    const encryptedData = encryptData(trackingDetails);
    return res.status(200).json({
          success: true,
          encrypted: true,
          data: encryptedData,
        });
  } catch (error) {
    res.json({ success: false, message: error.message || "Internal Server Error" });
  }
};

 const editParcel = async (req, res) => {
  try {
    const { id } = req.params;
    
    const parcel = await Parcel.findById(id);
    if (!parcel) {
      return res.json({ success: false, message: "Parcel not found" });
    }

    const { piece_number } = req.body;
    
    // Check if place number is being changed and if it already exists
    // if (piece_number && piece_number !== parcel.piece_number) {
    //   const existingParcel = await Parcel.findOne({ 
    //     order_id: parcel.order_id,
    //     piece_number,
    //     status: "1",
    //     _id: { $ne: id }
    //   });
      
    //   if (existingParcel) {
    //     return res.json({ 
    //       success: false, 
    //       errors: { placeNumber: "Place number already exists for this order" } 
    //     });
    //   }
    // }

    const updated = await Parcel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    }).populate("order_id", "cargoMode packed");

    res.json({ 
      success: true, 
      message: "Parcel updated successfully", 
    
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message:error.message || "Internal Server Error" });
  }
};

const deleteParcel = async (req, res) => {
  const { id } = req.params;
  try {
    const parcelDetails = await Parcel.findByIdAndUpdate(
      id,
      { is_deleted: 1 },
      { new: true }
    );
    if (!parcelDetails) {
      return res.json({ success: false, message: "Parcel Not Found" });
    }
    res.json({ success: true, message: "Parcel deleted successfully" });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
};


const addUpdateParcel = async (req, res) => {
  try {
    const { id, customerId, order_id, piece_number, piece_details, description} = req.body;

    if (id) {
      const existingParcel = await Parcel.findById(id);

      if (!existingParcel) {
        return res.status(404).json({
          success: false,
          message: "Parcel not found"
        });
      }

      existingParcel.customerId = customerId;
      existingParcel.order_id = order_id;
      existingParcel.piece_number = piece_number;
      existingParcel.piece_details = piece_details;
      existingParcel.description = description;


      await existingParcel.save();

      return res.json({
        success: true,
        message: "Parcel updated successfully",
        data: existingParcel
      });
    }


    const parcel = new Parcel({
      customerId, order_id, piece_number, piece_details, description
    });

    await parcel.save();

    return res.json({
      success: true,
      message: "Parcel added successfully",
      data: parcel
    });

  } catch (error) {
    console.error("ADD Parcel ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getNewParcelId = async (req, res) => {
  try{
    const {id} = req.params;
    const parcel = await Parcel.findOne({
      $or: [{ _id: id }, { customerId: id }],
      is_deleted: "0"
    });
    const responseData = {
      success:true,
      data:parcel
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
export {addUpdateParcel, getNewParcelId, addParcel,getTrakingDetailById, getParcels, getParcelById, getParcelsByOrder, editParcel, deleteParcel };