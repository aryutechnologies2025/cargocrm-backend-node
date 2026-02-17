import mongoose from "mongoose";

const loginLogSchema = new mongoose.Schema(
  {

    name: {
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

  

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Login",
      immutable: true
    }
  },
  { timestamps: true }
);

loginLogSchema.index({createdAt: -1 });
const LoginLog = mongoose.model("LoginLog", loginLogSchema);

export default LoginLog;
