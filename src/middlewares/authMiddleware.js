import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import LoginLog from "../models/loginLogModel.js";


const useAuth = (req, res, next) => {
  console.log("Cookies:", req.cookies);
  console.log("Auth Header:", req.headers.authorization);

  let token = null;

  //  Check Authorization header
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  //  Fallback to cookie
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(404).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.json({
      message: "Invalid or expired token",
    });
  }
};

export default useAuth;



