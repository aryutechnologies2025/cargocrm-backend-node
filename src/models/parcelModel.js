import mongoose from "mongoose";

const parcelSchema = new mongoose.Schema({
  parcel_id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
    required: true
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: [true, "Please provide an order ID"],
    validate: {
      validator: async function(value) {
        const order = await mongoose.model("Order").findById(value);
        return order !== null;
      },
      message: "Invalid order ID"
    }
  },
  placeNumber: {
    type: Number,
    required: [true, "Please provide a place number"],
    validate: {
      validator: function(value) {
        return value > 0;
      },
      message: "Place number must be greater than 0"
    }
  },
  weight: {
    type: Number,
    required: [true, "Please provide weight"],
    validate: {
      validator: function(value) {
        return value > 0;
      },
      message: "Weight must be greater than 0 kg"
    }
  },
  dimension: {
    type: String,
    required: [true, "Please provide dimensions"],
    trim: true,
    validate: {
      validator: function(value) {
        return value.trim().length > 0;
      },
      message: "Dimensions cannot be empty"
    }
  },
  description: {
    type: String,
    trim: true,
    default: ""
  },
  status: {
    type: String,
    required: [true, "Please select a status"],
    enum: {
      values: ["active", "inactive"],
      message: "Status must be either active or inactive"
    }
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LoginLog",
    
    immutable: true
  }
}, {
  timestamps: true
});

parcelSchema.index({ order_id: 1 });

const Parcel = mongoose.model("Parcel", parcelSchema);
export default Parcel;