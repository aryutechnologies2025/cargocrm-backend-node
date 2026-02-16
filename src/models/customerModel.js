import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
    required: true
  },
  name: {
    type: String,
    required: [true, "Please provide a customer name"],
    trim: true,
    minlength: [3, "Name must be at least 3 characters long"],
    validate: {
      validator: function(value) {
        return value.trim().length >= 3;
      },
      message: "Name must be at least 3 characters long"
    }
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    trim: true,
    lowercase: true,
    validate: [
      {
        validator: function(value) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: "Please provide a valid email address"
      }
    ]
  },
  phone: {
    type: String,
    required: [true, "Please provide a phone number"],
    validate: {
      validator: function(value) {
        return /^\d{10,15}$/.test(value);
      },
      message: "Phone number must be 10-15 digits"
    }
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

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // required: true,
    // immutable: true
  }
}, {
  timestamps: true
});


customerSchema.index({ name: 1 }); // Regular index instead of hashed
customerSchema.index({ email: 1 }, { unique: true });

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;