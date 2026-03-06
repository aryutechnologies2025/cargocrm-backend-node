import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

import crypto from "crypto";
import bcrypt from 'bcrypt';

import LoginLog from "../models/loginLogModel.js";

import express from "express";


const loginUser = async (req, res) => {
  console.log("LOGIN BODY:", req.body);

  try {
    const { email, password } = req.body;

    console.log("Login attempt for email:", email);

    const user = await User
      .findOne({ email })
      .select("+password")
      .populate("role", "name");
      
    console.log("User found:", user ? "Yes" : "No");
    
    if (!user) {
      return res.json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check if password field exists
    if (!user.password) {
      console.log("ERROR: No password field for user");
      return res.json({
        success: false,
        message: "Account error. Please contact support."
      });
    }

    // Use the model's comparePassword method
    const isMatch = await user.comparePassword(password);
    console.log("Password match result:", isMatch);
    
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check account status
    if (user.status === "0") {
      return res.json({
        success: false,
        message: "Your account is inactive. Please contact administrator."
      });
    }
    
    if (user.is_deleted === "1") {
      return res.json({
        success: false,
        message: "Your account is deleted. Please contact administrator."
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user?.role?.name || "",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Save login log
    const loginLog = await LoginLog.create({
      name: user?.name || "",
      ip: req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || req.ip || "unknown",
      login_time: new Date(),
      created_by: user._id
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
        firstName: user?.name || "",
        email: user.email,
        role: user?.role?.name || "",
        log_id: loginLog._id
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.json({
      success: false,
      message: "Login failed",
      error: err.message
    });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.json({
        message: "Name, Email and Password are required",
      });
    }

    // Check if user exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.json({ message: "Email Already Exists" });
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      role,
      status: "1"
    });

    // Save the user - this will trigger the pre-save hook
    await user.save();

    // Don't return the password in response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.json({
      success: true,
      message: "User Registration successfully",
      user: userResponse
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.json({ 
      success: false, 
      message: error.message || "Internal Server Error" 
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
    res.json({ message: error.message || "Forgot password failed" });
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
      // return res.redirect("http://localhost:5173");
    }

    user.password = password; // auto-hashed by pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    res.json({ message: error.message || "Reset password failed" });
  }
};


const logoutUser = async (req, res) => {
  const { id } = req.body;
  try {

    const logout = await LoginLog.updateOne({ _id: id }, { $set: { logout_time: new Date() } });

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development",
      // secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.json({ message: error.message || "Logout failed" });
  }

};


export { loginUser, registerUser, forgotPassword, logoutUser, resetPassword };


