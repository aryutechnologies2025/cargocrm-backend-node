import mongoose from "mongoose";

const collectionName = "orders";
const orderSchema = new mongoose.Schema({
  tracking_number: {
    type: String,
    unique: true,
    trim: true
  },
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
 
    
  },
  beneficiary_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Beneficiary",

  },
  cargo_mode: {
    type: String,
  },
  packed: {
    type: String,

  },
  status: {
    type: String,
  },

      is_deleted: {
    type: String,
    default: "0"
  },

  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    immutable: true
  }
}, {
  timestamps: true
});

orderSchema.index({ sender_id: 1 });
orderSchema.index({ beneficiary_id: 1 });

const Order = mongoose.model("Order", orderSchema, collectionName);
export default Order;