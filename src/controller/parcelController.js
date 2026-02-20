import e from "express";
import Order from "../models/orderModel.js";
import Parcel from "../models/parcelModel.js";
import { handleValidationError } from "./baseController.js";


 const addParcel = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.json({ success: false, message: "Data is required" });
    }

    const { order_id, piece_number, weight, length, width, height, description, status, created_by } = req.body;

    // Verify order exists and is active
    const order = await Order.findById({ _id: order_id, status: "1" });
    if (!order) {
      return res.json({ 
        success: false, 
        errors: { order_id: "Invalid  order" } 
      });
    }

    // Check if place number already exists for this order
    // const existingParcel = await Parcel.findOne({ 
    //   order_id, 
    //   piece_number,
    //   status: "1" 
    // });
    
    // if (existingParcel) {
    //   return res.json({ 
    //     success: false, 
    //     errors: { piece_number: "Place number already exists for this order" } 
    //   });
    // }

    const parcel = new Parcel({
      order_id,
      piece_number,
      weight,
      length,
      width,
      height,
      description: description || "",
      status,
      created_by
    });

    await parcel.save();
    
    await parcel.populate([
      { path: "order_id", select: "cargoMode packed" },
      { path: "created_by", select: "name email" }
    ]);

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
      .populate("order_id", "cargoMode packed sender_id beneficiary_id")
      .populate("created_by", "name email")
      .sort({ createdAt: -1 });
      
    res.json({ success: true, data: parcels });
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
export { addParcel, getParcels, getParcelById, getParcelsByOrder, editParcel, deleteParcel };