import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { isMongoConnected, connectDb } from "./src/config/db.js";
import Course from "./src/models/Course.js";
import { demoDb } from "./src/services/demoStore.js";

async function seedCourses() {
  const connected = await connectDb();
  if (!connected) {
    console.log("Could not connect to Mongo, or MONGO_URI not set.");
    process.exit(1);
  }
  console.log("Connected to MongoDB");

  await Course.deleteMany({});
  console.log("Cleared existing courses.");

  const demoCourses = await demoDb.courses.findAll();
  for (const course of demoCourses) {
    const { id, ...data } = course;
    await Course.create(data);
  }
  console.log(`Seeded ${demoCourses.length} courses into MongoDB with structured modules.`);

  process.exit(0);
}

seedCourses().catch(err => {
  console.error("Error seeding courses:", err);
  process.exit(1);
});
