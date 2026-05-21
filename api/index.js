// Vercel serverless entrypoint — wraps the existing Express app.
// Every request to /api/* is routed here by vercel.json.

const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("../server/config/db");
const app = require("../server/app");

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error("DB connection failed:", err);
    return res.status(500).json({
      message: `Database unavailable: ${err.message || "unknown error"}`,
    });
  }
  return app(req, res);
};
