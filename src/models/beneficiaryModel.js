import mongoose from "mongoose";

const collectionName = "beneficiaries";
const beneficiarySchema = new mongoose.Schema({
  customerId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },
  beneficiary_id: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true

  },
  phone: {
    type: String,

  },
  address: {
    type: String,

  },
  city: {
    type: String,
  },

  country: {
    type: String,

  },
  status: {
    type: String,
    default: "1"

  },

  is_deleted: {
    type: String,
    default: "0"
  },

  // created_by: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User",
  //   immutable: true
  // }
}, {
  timestamps: true
});

beneficiarySchema.index({ name: 1 });
beneficiarySchema.index({ email: 1 }, { unique: true });

const Beneficiary = mongoose.model("Beneficiary", beneficiarySchema, collectionName);
export default Beneficiary;