import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Cargo backend API running");
});

export default app;
