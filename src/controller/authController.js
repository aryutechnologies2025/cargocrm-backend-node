import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

 import crypto from "crypto";
 import bcrypt from 'bcrypt';
import LoginLog from "../models/loginLogModel.js";





const loginUser = async (req, res) => {
  try {
    // const { email, password } = req.body;
const { email, password } = req.body;

    console.log("Login attempt for email:", email);

    //  if (!captchaChecked) {
    //   return res.status(400).json({
    //     message: "Please verify captcha"
    //   });
    // }

    const user = await User.findOne({ email }).select("+password");
    console.log("User not found");
    if (!user || !user.status) {
       return res.status(200).json({sucees:"false",email:'Invalid email'});
    }

   const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(200).json({sucees:"false", password: 'Invalid password' });
    }

    // Generate JWT
     const token = jwt.sign(
      { id: user._id, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );


    // Set cookie
    res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  //  secure: false,          // MUST be false on localhost
  // sameSite: "lax", 
  //  maxAge: 60 * 1000
   maxAge: 60 * 60 * 1000
});

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR ", err);
    res.status(500).json({
      message: "Login failed",
      error: err.message
    });
  }
};


 const registerUser = async (req, res) => {
  try {
    const { firstName, email, password, role } = req.body;

    // Validate required fields
    if (!firstName || !email || !password) {
      return res.status(400).json({ 
        message: "Missing required fields",
        required: ["firstName", "email", "password"]
      });
    }

    // Check if firstName meets minimum length
    if (firstName.length < 3) {
      return res.status(400).json({ 
        message: "First name must be at least 3 characters long" 
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      firstName,
      email,
      password,   // auto-hashed by pre-save hook
      role: role || "staff", 
      createdBy: null
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Registration error details:", err);
    
    // Handle mongoose validation errors
    if (err.name === "ValidationError") {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({ 
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
      return res.status(400).json({ message: "Please verify captcha" });
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
    res.status(500).json({ message: "Forgot password failed" });
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
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = password; // auto-hashed by pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    res.status(500).json({ message: "Reset password failed" });
  }
};



// const logoutUser = async (req, res) => {
//   try {
//     await LoginLog.updateOne(
//       { userId: req.user._id, status: "active" },
//       { status: "inactive" }
//     );

//     res.json({
//       success: true,
//       message: "Logged out successfully"
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Logout failed"
//     });
//   }
// };

const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "development",
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
};


export { loginUser, registerUser, forgotPassword, logoutUser, resetPassword };
