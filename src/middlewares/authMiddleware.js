import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import LoginLog from "../models/loginLogModel.js";


const useAuth = (req, res, next) => {
  console.log("Cookies:", req.cookies);
  //  Get token from cookies
  const token = req.cookies?.token;
  console.log("Token from cookies:", token);

  //  Check if token exists
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  try {
    //  Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Optional: extra check
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    //  Attach user info to request
    req.user = decoded;

    //  Call next middleware
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({  message: "Session expired. Please login again."
 });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default useAuth;
