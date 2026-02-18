import mongoose from "mongoose";
import bcrypt from "bcrypt";

const collectionName = "users";

const userSchema = new mongoose.Schema(
  {

    name: {
      type: String,
      trim: true
    },

      last_name: {
        type: String,
        trim: true
      },
    

    email: {
      type: String,
      trim: true
      
    },

    password: {
      type: String,
      required: true,
      select: false //  never return password
    },

    phone: {
  type: String,
},

role: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Role",
},
    status: {
      
      type: String,

    },

    is_deleted: {
    type: String,
    default: "0"
  },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Login",
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



const User = mongoose.model("User", userSchema, collectionName);

export default User;
