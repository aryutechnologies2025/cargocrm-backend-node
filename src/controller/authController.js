import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

import crypto from "crypto";
import bcrypt from 'bcrypt';

import LoginLog from "../models/loginLogModel.js";

import express from "express";


const loginUser = async (req, res) => {
  console.log("=== LOGIN DEBUG ===");
  console.log("Request body:", { ...req.body, password: req.body.password ? "[REDACTED]" : "Not provided" });

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    console.log(`Login attempt for email: ${email}`);

    const user = await User
      .findOne({ email: email.toLowerCase() })
      .select("+password")
      .populate("role", "name");
      
    if (!user) {
      console.log("User not found");
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    console.log("User found:", user.email);
    console.log("Stored password hash exists:", !!user.password);
    
    if (user.password) {
      console.log("Stored password hash format:", user.password.substring(0, 20) + "...");
      console.log("Is valid bcrypt hash:", user.password.startsWith("$2b$"));
    }

    const isMatch = await user.comparePassword(password);
    console.log("Password match result:", isMatch);
    
    if (!isMatch) {
      console.log("Password mismatch for user:", email);
      
      await LoginLog.create({
        user: user._id,
        email: email,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        status: "failed",
        reason: "Invalid password"
      });
      
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    console.log("Login successful for user:", email);

    await LoginLog.create({
      user: user._id,
      email: email,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      status: "success"
    });

    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    const userData = user.toObject();
    delete userData.password;

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: userData
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed due to server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    console.log("=== REGISTRATION DEBUG ===");
    console.log("Email:", email);
    console.log("Password provided:", !!password);

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, Email and Password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ 
        success: false,
        message: "Email already exists" 
      });
    }

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role,
      status: "1"
    });

    console.log("Before save - password original:", password);

    await user.save();

    console.log("User saved with ID:", user._id);

    const savedUser = await User.findById(user._id).select("+password");
    console.log("After save - stored password hash:", savedUser.password);
    console.log("Is password hashed?", savedUser.password.startsWith("$2b$"));

    const verifyMatch = await bcrypt.compare(password, savedUser.password);
    console.log("Verification - password matches:", verifyMatch);
    
    if (!verifyMatch) {
      console.error("WARNING: Password verification failed after registration!");
    }

    console.log("=== REGISTRATION COMPLETE ===");

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userResponse
    });
  } catch (error) {
    console.error("Registration error:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }
    
    res.status(500).json({ 
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


