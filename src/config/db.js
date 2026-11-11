import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUrl = process.env.MONGO_URL || process.env.MONGO_URI;

  if (!mongoUrl) {
    throw new Error("MONGO_URL is missing. Add it to your .env file.");
  }

  await mongoose.connect(mongoUrl);
  console.log("MongoDB connected");
};

export default connectDB;
