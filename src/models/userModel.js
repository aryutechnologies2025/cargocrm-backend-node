import mongoose from "mongoose";
import bcrypt from "bcrypt";

const collectionName = "users";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      required: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      select: false
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
      default: "1"
    },
    is_hidden: {
      type: Boolean,
      default: false
    },
    is_deleted: {
      type: String,
      default: "0"
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      immutable: true
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function() {
  try {
    if (!this.isModified("password")) {
      return;
    }
    
    console.log(`Hashing password for user: ${this.email}`);
    console.log(`Original password length: ${this.password.length}`);
    
    if (this.password.startsWith("$2b$")) {
      console.log("Password appears to already be hashed, skipping...");
      return;
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    
    console.log(`Password hashed successfully. Hash: ${hashedPassword.substring(0, 20)}...`);
    this.password = hashedPassword;
  } catch (error) {
    console.error("Error in pre-save hook:", error);
    throw error;
  }
});


userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log("Comparing passwords...");
    
    if (!this.password) {
      console.error("No password stored for this user");
      return false;
    }
    
    if (!candidatePassword) {
      console.error("No candidate password provided");
      return false;
    }
    
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log(`Password match result: ${isMatch}`);
    
    return isMatch;
  } catch (error) {
    console.error("Error comparing password:", error);
    return false;
  }
};

userSchema.statics.verifyPassword = async function(email, candidatePassword) {
  try {
    const user = await this.findOne({ email }).select("+password");
    if (!user) {
      console.log("User not found for verification");
      return false;
    }
    
    return await user.comparePassword(candidatePassword);
  } catch (error) {
    console.error("Error in verifyPassword:", error);
    return false;
  }
};

userSchema.index({ role: 1 });

const User = mongoose.model("User", userSchema, collectionName);
export default User;