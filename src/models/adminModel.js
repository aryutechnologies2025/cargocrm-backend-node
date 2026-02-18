import mongoose from "mongoose";
import bcrypt from "bcrypt";

const loginSchema = new mongoose.Schema(
  {

    name: {
      type: String,
   trim: true
    },

    email: {
      type: String,
      trim: true
      
    },

    password: {
      type: String,
      select: false //  never return password
    },

    phone: {
  type: String
},

    resetPasswordToken: String,
resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Hash password
loginSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

//  Compare password
loginSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

loginSchema.index({ email: 1 });

const Login = mongoose.model("Login", loginSchema);

export default Login;
