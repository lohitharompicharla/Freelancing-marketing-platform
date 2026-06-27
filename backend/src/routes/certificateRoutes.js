import express from "express";
import Certificate from "../models/Certificate.js";
import { isMongoConnected } from "../config/db.js";
import { demoDb } from "../services/demoStore.js";

const router = express.Router();

router.post("/generate", async (req, res) => {
  try {
    const { userId, courseName, score } = req.body;
    
    if (score < 70) {
      return res.status(400).json({ error: "Score must be at least 70 to generate a certificate" });
    }
    
    let certificate;
    if (isMongoConnected()) {
      certificate = await Certificate.create({
        user_id: userId,
        course_name: courseName,
        score: score,
        issued_at: new Date()
      });
    } else {
      certificate = await demoDb.certificates.insert({
        user_id: userId,
        course_name: courseName,
        score: score,
        issued_at: new Date().toISOString()
      });
    }
    
    res.status(201).json(certificate);
  } catch (error) {
    console.error("Generate Certificate Error:", error);
    res.status(500).json({ error: "Failed to generate certificate", details: error.message });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    let certificates;
    
    if (isMongoConnected()) {
      certificates = await Certificate.find({ user_id: userId }).sort({ issued_at: -1 });
    } else {
      const allCerts = await demoDb.certificates.findAll();
      certificates = allCerts
        .filter(c => c.user_id === userId)
        .sort((a, b) => new Date(b.issued_at) - new Date(a.issued_at));
    }
    
    res.status(200).json(certificates);
  } catch (error) {
    console.error("Get Certificates Error:", error);
    res.status(500).json({ error: "Failed to fetch certificates" });
  }
});

export default router;
