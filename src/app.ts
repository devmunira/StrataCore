import express, { Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";

dotenv.config();
connectDB();

const app = express();

app.use([express.json()]);

app.get("/health", (_req: Request, res: Response) => {
  res.send("API health is ok");
});

// Routes here

export default app;
