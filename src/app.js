// import express from "express";
// import cors from "cors";

// const app = express();

// app.use(cors());
// app.use(express.json());

// // test route
// app.get("/", (req, res) => {
//   res.send("Cargo backend API running");
// });

// export default app;


import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";


import authRoutes from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import roleRouter from "./routes/roleRouter.js";
import useAuth from "./middlewares/authMiddleware.js";
import customerRouter from "./routes/customerRouter.js";
import beneficiaryRouter from "./routes/beneficiaryRouter.js";


const app = express();

//  Global Middleware
app.use(morgan("dev"));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//  Route Registration
// Public Routes
app.use("/api/auth", authRoutes);

// Protected Routes (Require Authentication)
app.use("/api/users", useAuth, userRouter);
// app.use("/api/roles", useAuth, roleRouter);
app.use("/api/roles", roleRouter);
app.use("/api/customers",useAuth, customerRouter);
app.use("/api/beneficiary",useAuth,beneficiaryRouter);


//  Test Route
app.get("/", (req, res) => res.send("Cargo backend API running"));

export default app; // Export the configured engine