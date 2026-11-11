import "dotenv/config";

const PORT = process.env.PORT || 5000;

try {
  if (!process.env.MONGO_URL && !process.env.MONGO_URI) {
    throw new Error("MONGO_URL is missing. Add it to your .env file.");
  }

  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is missing. Add it to your .env file.");
  }

  const [{ default: app }, { default: connectDB }] = await Promise.all([
    import("./src/app.js"),
    import("./src/config/db.js"),
  ]);

  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
} catch (error) {
  console.error(`Server startup failed: ${error.message}`);
  process.exit(1);
}
