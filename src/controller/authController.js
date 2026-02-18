import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

 import crypto from "crypto";
 import bcrypt from 'bcrypt';

import LoginLog from "../models/loginLogModel.js";
import Login from "../models/adminModel.js";




//login
const loginUser = async (req, res) => {
  try {

const { email, password } = req.body;

    console.log("Login attempt for email:", email);

   //  Check user exists
    const user = await Login.findOne({ email }).select("+password");
    if (!user) {
      return res.json({
        success: false,
        message: "Invalid email or password"
      });
    }
  
    //  Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid email or password"
      });
    }


    // Generate JWT
     const token = jwt.sign(
      { id: user._id, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

       // Save login log
    await LoginLog.create({
      name: user.name,
      ip: req.ip,
      loginTime: new Date(),
      createdBy: user._id
    });

    // Set cookie
    res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",

   maxAge: 60 * 60 * 1000
});

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.name,
        email: user.email,
        // role: user.role
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR ", err);
    res.json({
      message: "Login failed",
      error: err.message
    });
  }
};


 const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.json({ 
        message: "Missing required fields",
        required: ["firstName", "email", "password"]
      });
    }

    // Check if firstName meets minimum length
    if (name.length < 3) {
      return res.json({ 
        message: "First name must be at least 3 characters long" 
      });
    }

    const exists = await Login.findOne({ email });
    if (exists) {
      return res.json({ message: "Email Already Exists" });
    }

    const user = await Login.create({
      name,
      email,
      password,   // auto-hashed by pre-save hook
    
    });

    res.json({
      success: true,
      message: "User Registration successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      
      }
    });
  } catch (err) {
    console.error("Registration error details:", err);
    
    // Handle mongoose validation errors
    if (err.name === "ValidationError") {
      return res.json({ 
        message: "Validation error", 
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    
    res.json({ 
      message: "Registration failed",
      error: err.message 
    });
  }
};


 const forgotPassword = async (req, res) => {
  try {
    const { email, captchaChecked } = req.body;

    //captcha check
    if (!captchaChecked) {
      return res.json({ message: "Please verify captcha" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal user existence
      return res.json({ message: "If email exists, reset link sent" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before saving
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins

    await user.save();

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;


    console.log("RESET LINK ", resetUrl);

    res.json({
      message: "Password reset link sent"
    });

  } catch (error) {
    res.json({ message: "Forgot password failed" });
  }
};

 const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.json({ message: "Invalid or expired token" });
    }

    user.password = password; // auto-hashed by pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    res.json({ message: "Reset password failed" });
  }
};


const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "development",
    sameSite: "strict",
  });
  res.json({ message: "Logged out successfully" });
};


export { loginUser, registerUser, forgotPassword, logoutUser, resetPassword };


