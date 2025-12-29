import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import { QueryLog } from "../models/QueryLog.js";
import { ChatSession } from "../models/ChatSession.js";

export const analyticsRouter = express.Router();
analyticsRouter.use(adminAuth);

analyticsRouter.get("/summary", async (_req, res) => {
  const [sessions, queries] = await Promise.all([
    ChatSession.countDocuments(),
    QueryLog.countDocuments()
  ]);

  const avg = await QueryLog.aggregate([
    { $group: { _id: null, avgMs: { $avg: "$responseTimeMs" } } }
  ]);

  res.json({
    sessions,
    queries,
    avgResponseTimeMs: avg[0]?.avgMs ? Math.round(avg[0].avgMs) : 0
  });
});

analyticsRouter.get("/top-queries", async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || "10", 10), 50);
  const rows = await QueryLog.aggregate([
    { $group: { _id: "$query", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
  res.json(rows.map((r) => ({ query: r._id, count: r.count })));
});

analyticsRouter.get("/daily", async (req, res) => {
  const days = Math.min(parseInt(req.query.days || "14", 10), 90);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const rows = await QueryLog.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: {
          y: { $year: "$createdAt" },
          m: { $month: "$createdAt" },
          d: { $dayOfMonth: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } }
  ]);

  res.json(
    rows.map((r) => ({
      date: `${r._id.y}-${String(r._id.m).padStart(2, "0")}-${String(r._id.d).padStart(2, "0")}`,
      count: r.count
    }))
  );
});
