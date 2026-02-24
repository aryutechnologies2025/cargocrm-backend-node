import mongoose from "mongoose";

const collectionName = "parcels";
const parcelSchema = new mongoose.Schema({

  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
    

  },
  piece_number: {
    type: String,
  },
  weight: {
    type: String,
    trim: true
  },

  length: {
    type: String,
    trim: true
  },
  width: {
    type: String,
    trim: true
  },
  height: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ""
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

parcelSchema.index({ order_id: 1 });

const Parcel = mongoose.model("Parcel", parcelSchema, collectionName);
export default Parcel;