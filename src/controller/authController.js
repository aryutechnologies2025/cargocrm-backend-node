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
      
    console.log("USER FROM DB:", user);
    
    if (!user) {
      return res.json({
        success: false,
        message: "Invalid email or password"
      });
    }
    
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user?.role?.name || "",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const loginLog = await LoginLog.create({
      name: user?.name || "",
      ip: req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || req.ip || "unknown",
      login_time: new Date(),
      created_by: user._id
    });

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
    console.error("LOGIN ERROR ", err);
    res.json({
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

    // Check if name meets minimum length
    if (name.length < 3) {
      return res.json({
        message: "Name must be at least 3 characters long"
      });
    }

    // Check if user exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.json({ message: "Email Already Exists" });
    }

    // Hash password manually if pre-save hook isn't working
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword, // Use hashed password explicitly
      role
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
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message || "Internal Server Error" });
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


