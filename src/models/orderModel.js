import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
    required: true
  },
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: [true, "Please provide a sender"],
    validate: {
      validator: async function(value) {
        const customer = await mongoose.model("Customer").findById(value);
        return customer !== null;
      },
      message: "Invalid sender ID"
    }
  },
  beneficiary_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Beneficiary",
    required: [true, "Please provide a beneficiary"],
    validate: {
      validator: async function(value) {
        const beneficiary = await mongoose.model("Beneficiary").findById(value);
        return beneficiary !== null;
      },
      message: "Invalid beneficiary ID"
    }
  },
  cargoMode: {
    type: String,
    required: [true, "Please select cargo mode"],
    enum: {
      values: ["sea", "air"],
      message: "Cargo mode must be either sea or air"
    }
  },
  packed: {
    type: String,
    required: [true, "Please provide packing details"],
    trim: true,
    validate: {
      validator: function(value) {
        return value.trim().length > 0;
      },
      message: "Packing details cannot be empty"
    }
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

orderSchema.index({ sender_id: 1 });
orderSchema.index({ beneficiary_id: 1 });

const Order = mongoose.model("Order", orderSchema);
export default Order;