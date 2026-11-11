import "dotenv/config";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import configRoutes from "./routes/configRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

const app = express();
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is missing. Add it to your .env file.");
}

const mongoUrl = process.env.MONGO_URL || process.env.MONGO_URI;

if (!mongoUrl) {
  throw new Error("MONGO_URL is missing. Add it to your .env file.");
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "ucs.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 8,
    },
  }),
);

app.use(express.static(path.join(currentDirectory, "../public")));
app.use(
  "/vendor/lucide",
  express.static(
    path.join(currentDirectory, "../node_modules/lucide/dist/umd"),
  ),
);

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/config", configRoutes);
app.use("/api/contact", contactRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

app.use((error, req, res, next) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || "value";
    const labels = {
      email: "Email address",
      matriculationNumber: "Matriculation number",
      referenceNumber: "Complaint reference",
    };
    return res.status(409).json({
      success: false,
      message: `${labels[field] || "This value"} is already in use`,
    });
  }

  if (error.name === "ValidationError") {
    const message = Object.values(error.errors)[0]?.message || "Invalid input";
    return res.status(400).json({ success: false, message });
  }

  if (error.name === "CastError") {
    return res
      .status(400)
      .json({ success: false, message: "Invalid record identifier" });
  }

  console.error(error);
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode ? error.message : "Internal server error",
  });
});

export default app;
