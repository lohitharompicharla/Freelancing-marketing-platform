import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import { connectDb } from "./src/config/db.js";
import Course from "./src/models/Course.js";

async function test() {
  await connectDb();
  const courses = await Course.find().lean();
  console.log(JSON.stringify(courses, null, 2));
  process.exit(0);
}
test();
