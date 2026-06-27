import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../src/models/User.js";
import { connectDb } from "../src/config/db.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDb();

    // Check if admin already exists
    const adminExists = await User.findOne({ email: "admin@freelanceflow.com" });

    if (adminExists) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    const admin = await User.create({
      name: "Super Admin",
      email: "admin@freelanceflow.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin created successfully:", admin.email);
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

seedAdmin();
