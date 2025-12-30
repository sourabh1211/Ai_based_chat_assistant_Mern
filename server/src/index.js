import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import { chatRouter } from "./routes/chat.js";
import { adminRouter } from "./routes/admin.js";
import { analyticsRouter } from "./routes/analytics.js";

const app = express();

app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true
  })
);

app.use(
  "/api/",
  rateLimit({
    windowMs: 60 * 1000,
    max: 120
  })
);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/chat", chatRouter);
app.use("/api/admin", adminRouter);
app.use("/api/analytics", analyticsRouter);

const port = process.env.PORT || 8080;

async function start() {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("Database is set up");

    app.listen(port, () => {
      console.log(`Backend is start on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to start:", err?.message || err);
    process.exit(1);
  }
}

start();
