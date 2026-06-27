import mongoose from "mongoose";

let mongoConnected = false;

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection established error:", err.message);
});

export const connectDb = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.log("MongoDB not configured. Using local demo store.");
    return false;
  }

  try {
    await mongoose.connect(mongoUri);
    mongoConnected = true;
    console.log("MongoDB connected.");
    return true;
  } catch (error) {
    mongoConnected = false;
    console.error("MongoDB connection failed. Falling back to demo store.");
    console.error(error.message);
    return false;
  }
};

export const isMongoConnected = () => mongoConnected;
