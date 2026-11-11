import "dotenv/config";
import connectDB from "../config/db.js";
import User from "../models/User.js";

async function createAdmin() {
  try {
    const fullName = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!fullName || !email || !password) {
      throw new Error(
        "ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD are required in .env",
      );
    }

    await connectDB();

    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log(
        "An administrator account already exists. No new account was created.",
      );
      process.exit(0);
    }

    await User.create({
      fullName,
      email,
      password,
      role: "admin",
    });

    console.log("Administrator account created successfully.");
    process.exit(0);
  } catch (error) {
    console.error(`Administrator setup failed: ${error.message}`);
    process.exit(1);
  }
}

createAdmin();
