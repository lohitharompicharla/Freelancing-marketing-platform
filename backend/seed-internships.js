import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { isMongoConnected, connectDb } from "./src/config/db.js";
import Internship from "./src/models/Internship.js";
import User from "./src/models/User.js";
import { demoDb } from "./src/services/demoStore.js";

async function seedInternships() {
  const connected = await connectDb();
  if (!connected) {
    console.log("Could not connect to Mongo, or MONGO_URI not set.");
    process.exit(1);
  }
  console.log("Connected to MongoDB");

  const existing = await Internship.countDocuments();
  if (existing === 0) {
    const demoInternships = await demoDb.internships.findAll();
    const defaultUser = await User.findOne({ role: 'client' });
    const creatorId = defaultUser ? defaultUser._id : new mongoose.Types.ObjectId();

    for (const internship of demoInternships) {
      const { id, ...data } = internship;
      data.createdBy = creatorId;
      await Internship.create(data);
    }
    console.log(`Seeded ${demoInternships.length} internships into MongoDB.`);
  } else {
    console.log(`MongoDB already has ${existing} internships.`);
  }

  process.exit(0);
}

seedInternships().catch(err => {
  console.error("Error seeding internships:", err);
  process.exit(1);
});
