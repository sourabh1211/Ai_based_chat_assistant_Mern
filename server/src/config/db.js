import mongoose from "mongoose";

export async function connectDB(uri) {
  if (!uri) throw new Error("MONGO_URI is missing in .env");
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
}
