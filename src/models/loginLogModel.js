import mongoose from "mongoose";

const collectionName = "loginlogs";
const loginLogSchema = new mongoose.Schema(
  {

    name: {
      type: String,
trim: true
    },

    login_time: {
      type: Date,
      default: Date.now
    },

    logout_time: {
      type: Date,
      default: null
    },

    ip: {
      type: String,
      trim: true
    },

  

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      immutable: true
    }
  },
  { timestamps: true }
);

loginLogSchema.index({createdAt: -1 });
const LoginLog = mongoose.model("LoginLog", loginLogSchema, collectionName);

export default LoginLog;
