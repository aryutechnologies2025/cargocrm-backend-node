import mongoose from "mongoose";
// import app from "./app.js";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import roleRouter from "./routes/roleRouter.js";
import userRouter from "./routes/userRoutes.js";
import useAuth from "./middlewares/authMiddleware.js";
import customerRouter from "./routes/customerRouter.js";
import beneficiaryRouter from "./routes/beneficiaryRouter.js";
import orderRouter from "./routes/orderRouter.js";
import parcelRouter from "./routes/parcelRouter.js";
import containerRunRouter from "./routes/containerRunRouter.js";
import eventRouter from "./routes/eventRouter.js";
import contactUsRouter from "./routes/contactUsRouter.js";
// import loginLogRouter from "./routes/loginLogRoutes.js";

dotenv.config(); // Load environment variables

// Initialize app
const app = express();

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


  console.log("Registering auth routes");
app.use("/api/auth", authRoutes);
// app.use("/api/login-logs", loginLogRouter);
app.use("/api/roles",useAuth, roleRouter);
app.use("/api/users",useAuth, userRouter);
// app.use("/api/users", userRouter);
app.use("/api/customers",useAuth, customerRouter);
app.use("/api/beneficiary",useAuth, beneficiaryRouter);
app.use("/api/orders",useAuth, orderRouter);
app.use("/api/parcels",useAuth, parcelRouter);
app.use("/api/containerRuns",useAuth, containerRunRouter);
app.use("/api/events",useAuth, eventRouter);
app.use("/api/contacts",useAuth, contactUsRouter);





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


// import app from "./app.js";
// import dotenv from "dotenv";
// import connectDB from "./config/database.js";


// dotenv.config();  //loads .env file

// // Connect to Database
// connectDB();

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Cargo backend running on port ${PORT}`);
// });