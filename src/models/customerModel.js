import mongoose from "mongoose";

const collectionName = "customers";
const customerSchema = new mongoose.Schema({
  
  // customer_id: {
  //   type: String,
  //   unique: true
  // },
  tracking_number:{
    type: String,
    unique: true,
    trim: true
  },
  customerName: {
    type: String,
    trim: true

  },
  customerEmail: {
    type: String,
    // unique: true,
    trim: true
   
  },
  customerPhone: {
    type: String,
  },
  customerAddress: {
    type: String,
   
  },
  
  customerCity: {
    type: String,
   
  },
  customerCountry: {
    type: String,
   
  },
  customerPostcode:{
    type:String
  },
  beneficiaryName:{
    type: String,
  },
  beneficiaryEmail:{
    type: String,
  },
  beneficiaryPhone:{
    type:String
  },
  beneficiaryAddress:{
    type: String,
  },
  beneficiaryCity:{
    type: String,
  },
  beneficiaryCountry:{  
    type: String,
  },
  beneficiaryPostcode:{
    type: String
  },
  piece_number:{
    type: String,
  },
  piece_details: [
    {
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
    }],
    description:{
    type: String,
    trim: true,
    },
    cargo_mode:{
      type: String,
    },
    packed:{
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
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    immutable: true
  }
}, {
  timestamps: true
});


customerSchema.index({ customerName: 1 });
customerSchema.index({ beneficiaryName: 1 });
customerSchema.index({ tracking_number: 1 });
// customerSchema.index({ email: 1 }, { unique: true });


const Customer = mongoose.model("Customer", customerSchema, collectionName);
export default Customer;