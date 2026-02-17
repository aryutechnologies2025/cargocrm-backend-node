import mongoose from "mongoose";

const collectionName = "customers";
const customerSchema = new mongoose.Schema({
  // customer_id: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   auto: true,
  //   required: true
  // },
  customer_id: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: [true, "Please provide a customer name"],
    trim: true,
   
   
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    trim: true,
    
   
  },
  phone: {
    type: String,
    required: [true, "Please provide a phone number"],
    // validate: {
    //   validator: function(value) {
    //     return /^\d{10,15}$/.test(value);
    //   },
    //   message: "Phone number must be 10-15 digits"
    // }
  },
  address: {
    type: String,
    required: [true, "Please provide an address"],
    trim: true
  },
  status: {
    type: String,
    required: [true, "Please select a status"],
    // enum: {
    //   values: ["active", "inactive"],
    //   message: "Status must be either active or inactive"
    // }
  },

  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    // required: true,
    // immutable: true
  }
}, {
  timestamps: true
});


customerSchema.index({ name: 1 }); // Regular index instead of hashed
customerSchema.index({ email: 1 }, { unique: true });

const Customer = mongoose.model("Customer", customerSchema, collectionName);
export default Customer;