import mongoose from "mongoose";
import bcrypt from "bcrypt";


const loginSchema = new mongoose.Schema(
  {

    name: {
      type: String,
      required: true,
    
      
    },

    email: {
      type: String,
      required: true,
      // unique: true,
      trim: true
      
    },

    password: {
      type: String,
      required: true,
      select: false //  never return password
    },

    phoneNumber: {
  type: String,
  match: /^[0-9]{10,15}$/,
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
// userSchema.index({ email: 1 }, { unique: true });
const Login = mongoose.model("Login", loginSchema);

export default Login;
