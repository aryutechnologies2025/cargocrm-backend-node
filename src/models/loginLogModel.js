import mongoose from "mongoose";

const loginLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    firstName: {
      type: String,
      required: true
    },

    loginTime: {
      type: Date,
      required: true,
      default: Date.now
    },

    ip: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      required: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      immutable: true
    }
  },
  { timestamps: true }
);

loginLogSchema.index({ loginTime: 1, userId: 1 });
const LoginLog = mongoose.model("LoginLog", loginLogSchema);

export default LoginLog;
