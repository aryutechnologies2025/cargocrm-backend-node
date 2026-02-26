import mongoose from "mongoose";

const collectionName = "customers";
const customerSchema = new mongoose.Schema({
  
  // customer_id: {
  //   type: String,
  //   unique: true
  // },
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


customerSchema.index({ name: 1 }); // Regular index instead of hashed
customerSchema.index({ email: 1 }, { unique: true });


const Customer = mongoose.model("Customer", customerSchema, collectionName);
export default Customer;