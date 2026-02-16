import Order from "../models/orderModel.js";
import Parcel from "../models/parcelModel.js";
import { handleValidationError } from "./baseController.js";


 const addParcel = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: "Data is required" });
    }

    const { order_id, placeNumber, weight, dimension, description, status } = req.body;

    // Verify order exists and is active
    const order = await Order.findOne({ _id: order_id, status: "active" });
    if (!order) {
      return res.status(400).json({ 
        success: false, 
        errors: { order_id: "Invalid or inactive order" } 
      });
    }

    // Check if place number already exists for this order
    const existingParcel = await Parcel.findOne({ 
      order_id, 
      placeNumber,
      status: "active" 
    });
    
    if (existingParcel) {
      return res.status(400).json({ 
        success: false, 
        errors: { placeNumber: "Place number already exists for this order" } 
      });
    }

    const parcel = new Parcel({
      order_id,
      placeNumber,
      weight,
      dimension,
      description: description || "",
      status,
      createdBy: req.user._id
    });

    await parcel.save();
    
    await parcel.populate([
      { path: "order_id", select: "cargoMode packed" },
      { path: "createdBy", select: "name email" }
    ]);

    res.status(201).json({ 
      success: true, 
      message: "Parcel added successfully", 
      data: parcel 
    });

  } catch (error) {
    console.log("error", error);
    const validationError = handleValidationError(error, res);
    if (validationError) return;
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

 const getParcels = async (req, res) => {
  try {
    const parcels = await Parcel.find({ status: "active" })
      .populate("order_id", "cargoMode packed sender_id beneficiary_id")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
      
    res.status(200).json({ success: true, data: parcels });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
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
      .populate("createdBy", "name email");
    
    if (!parcel) {
      return res.status(404).json({ success: false, message: "Parcel not found" });
    }
    
    res.status(200).json({ success: true, data: parcel });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

 const getParcelsByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const parcels = await Parcel.find({ 
      order_id: orderId,
      status: "active" 
    })
      .populate("createdBy", "name email")
      .sort({ placeNumber: 1 });
      
    res.status(200).json({ success: true, data: parcels });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

 const editParcel = async (req, res) => {
  try {
    const { id } = req.params;
    
    const parcel = await Parcel.findById(id);
    if (!parcel) {
      return res.status(404).json({ success: false, message: "Parcel not found" });
    }

    const { placeNumber } = req.body;
    
    // Check if place number is being changed and if it already exists
    if (placeNumber && placeNumber !== parcel.placeNumber) {
      const existingParcel = await Parcel.findOne({ 
        order_id: parcel.order_id,
        placeNumber,
        status: "active",
        _id: { $ne: id }
      });
      
      if (existingParcel) {
        return res.status(400).json({ 
          success: false, 
          errors: { placeNumber: "Place number already exists for this order" } 
        });
      }
    }

    const updated = await Parcel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    }).populate("order_id", "cargoMode packed");

    res.status(200).json({ 
      success: true, 
      message: "Parcel updated successfully", 
      data: updated 
    });
  } catch (error) {
    console.log("error", error);
    const validationError = handleValidationError(error, res);
    if (validationError) return;
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

 const deleteParcel = async (req, res) => {
  try {
    const parcel = await Parcel.findById(req.params.id);
    
    if (!parcel) {
      return res.status(404).json({ success: false, message: "Parcel not found" });
    }

    parcel.status = "inactive";
    await parcel.save();

    res.status(200).json({ success: true, message: "Parcel deactivated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { addParcel, getParcels, getParcelById, getParcelsByOrder, editParcel, deleteParcel };