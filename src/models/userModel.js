import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {

    name: {
      type: String,
      required: true,
      minlength: 3,
      
    },

      lastName: {
        type: String,
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


    role: {
      type: String,
      enum: ["admin", "staff"],
      default: "staff"
    },

    status: {
      // type: Boolean,
      type: String,
      required: [true, "Please select a status"]
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      immutable: true
    },
    resetPasswordToken: String,
resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Hash password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

//  Compare password
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.index({ email: 1 });
// userSchema.index({ email: 1 }, { unique: true });
const User = mongoose.model("User", userSchema);

export default User;
