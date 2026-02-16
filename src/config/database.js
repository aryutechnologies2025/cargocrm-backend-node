import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
//          useNewUrlParser: true,
//   useUnifiedTopology: true,
      autoIndex: process.env.NODE_ENV !== "production"   // new version Automatically creates indexes defined in  schemas(index creation control)
    });
    console.log(" MongoDB connected");
  } catch (error) {
    console.error(" MongoDB error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
