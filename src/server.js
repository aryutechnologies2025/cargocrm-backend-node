import mongoose from "mongoose";

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import roleRouter from "./routes/roleRouter.js";

import useAuth from "./middlewares/authMiddleware.js";
import customerRouter from "./routes/customerRouter.js";
import beneficiaryRouter from "./routes/beneficiaryRouter.js";
import orderRouter from "./routes/orderRouter.js";
import parcelRouter from "./routes/parcelRouter.js";
import containerRunRouter from "./routes/containerRunRouter.js";
import eventRouter from "./routes/eventRouter.js";
import contactUsRouter from "./routes/contactUsRouter.js";
import userRouter from "./routes/userRoutes.js";
import loginLogRouter from "./routes/loginLogRoutes.js";
import collectionRouter from "./routes/collectionRouter.js";
import eventMasterRouter from "./routes/eventMasterRouter.js";
import settingRouter from "./routes/settingRouter.js";
dotenv.config(); // Load environment variables

// Initialize app
const app = express();

//  Global Middleware
app.use(morgan("dev"));

app.use(
  cors({
    origin: true, // allow all origins
    credentials: true, // allow cookies/auth headers
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


 
  // Public Routes
app.use("/api/auth", authRoutes);

// Protected Routes (Require Authentication)
app.use("/api/roles",useAuth, roleRouter);
app.use("/api/users",useAuth, userRouter);
// app.use("/api/users", userRouter);
app.use("/api/customers",useAuth, customerRouter);
app.use("/api/beneficiary",useAuth, beneficiaryRouter);
app.use("/api/orders",useAuth, orderRouter);
app.use("/api/parcels",useAuth, parcelRouter);
app.use("/api/containerruns",useAuth, containerRunRouter);
app.use("/api/events",useAuth, eventRouter);
app.use("/api/contacts", contactUsRouter);
app.use("/api/logs",useAuth, loginLogRouter);
app.use("/api/collections",useAuth, collectionRouter);
app.use("/api/eventmasters",useAuth, eventMasterRouter);
app.use("/api/settings",useAuth, settingRouter);

//  Test Route
app.get("/api", (req, res) => res.send("Cargo backend API running"));
app.get("/api/test", (req, res) => res.send("Cargo backend API TEST running"));


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    
    // Start server only after DB connection is successful
     app.get('/api', (req, res) => res.send('API is running...'));
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Cargo backend running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });


// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import app from "./app.js"; // Import the configured app

// dotenv.config();

// const PORT = process.env.PORT || 5000;

// // Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log(" MongoDB Connected");
    
//     // Only start listening once the DB is ready
//     app.listen(PORT, () => {
//       console.log(` Cargo backend running on port ${PORT}`);
//     });
//   })
//   .catch(err => {
//     console.error(" MongoDB connection error:", err);
//     process.exit(1);
//   });