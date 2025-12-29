import "dotenv/config";
import { connectDB } from "../config/db.js";
import { Article } from "../models/Article.js";

const demo = [
  {
    title: "Reset your password",
    slug: "reset-password",
    tags: ["account", "login"],
    body:
      "To reset your password: 1) Go to Login. 2) Click 'Forgot password'. 3) Enter your email. " +
      "4) Open the reset link sent to your inbox. 5) Set a new password."
  },
  {
    title: "Refund policy",
    slug: "refund-policy",
    tags: ["billing", "payments"],
    body:
      "Refunds are available within 7 days of purchase if the service was not used. " +
      "To request a refund, contact support with your order ID and reason."
  },
  {
    title: "Update profile information",
    slug: "update-profile",
    tags: ["account", "profile"],
    body:
      "To update your profile: 1) Go to Settings. 2) Edit your info. 3) Click Save."
  }
];

await connectDB(process.env.MONGO_URI);
await Article.deleteMany({});
await Article.insertMany(demo);

console.log("Seeded demo articles:", demo.length);
process.exit(0);
