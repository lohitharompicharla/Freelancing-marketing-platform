import Certification from "../models/Certification.js";
import { isMongoConnected } from "../config/db.js";
import { demoDb } from "../services/demoStore.js";

// @desc    Get all verified certifications with filtering & pagination
// @route   GET /api/certifications
// @access  Public
export const getCertifications = async (req, res) => {
  try {
    const { domain, difficulty, provider, search, limit = 20 } = req.query;
    
    if (isMongoConnected()) {
      let query = { isVerified: true };
      if (domain) query.domain = domain;
      if (difficulty) query.difficulty = difficulty;
      if (provider) query.provider = provider;
      if (search) {
        query.title = { $regex: search, $options: "i" };
      }
      
      const certifications = await Certification.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit));
        
      res.json(certifications);
    } else {
      let certifications = await demoDb.certifications.findAll();
      certifications = certifications.filter(c => c.isVerified === true);
      
      if (domain) certifications = certifications.filter(c => c.domain === domain);
      if (difficulty) certifications = certifications.filter(c => c.difficulty === difficulty);
      if (provider) certifications = certifications.filter(c => c.provider === provider);
      if (search) {
        const searchLower = search.toLowerCase();
        certifications = certifications.filter(c => c.title.toLowerCase().includes(searchLower));
      }
      
      res.json(certifications.slice(0, Number(limit)));
    }
  } catch (error) {
    res.status(500).json({ message: "Server error fetching certifications", error: error.message });
  }
};

// @desc    Get certification by ID
// @route   GET /api/certifications/:id
// @access  Public
export const getCertificationById = async (req, res) => {
  try {
    let certification;
    if (isMongoConnected()) {
      certification = await Certification.findById(req.params.id);
    } else {
      certification = await demoDb.certifications.findById(req.params.id);
    }
    
    if (!certification) {
      return res.status(404).json({ message: "Certification not found" });
    }
    res.json(certification);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching certification", error: error.message });
  }
};

// @desc    Get recommendations (Top Picks for Beginners)
// @route   GET /api/certifications/recommendations/top
// @access  Public
export const getRecommendations = async (req, res) => {
  try {
    const { domain, level = "Beginner" } = req.query;
    
    const providerPriority = {
      "Google": 1,
      "Coursera": 2,
      "edX": 3,
      "LinkedIn Learning": 4,
      "Udemy": 5,
      "AWS": 6,
      "Meta": 7
    };

    if (isMongoConnected()) {
      let query = { isVerified: true, difficulty: level };
      if (domain) query.domain = domain;
      
      let certifications = await Certification.find(query);
      
      // Sort in JS because provider enum sorting is complex in Mongoose without aggregation
      certifications.sort((a, b) => {
        return (providerPriority[a.provider] || 99) - (providerPriority[b.provider] || 99);
      });
      
      res.json(certifications.slice(0, 6));
    } else {
      let certifications = await demoDb.certifications.findAll();
      certifications = certifications.filter(c => c.isVerified === true && c.difficulty === level);
      
      if (domain) {
        certifications = certifications.filter(c => c.domain === domain);
      }
      
      certifications.sort((a, b) => {
        return (providerPriority[a.provider] || 99) - (providerPriority[b.provider] || 99);
      });
      
      res.json(certifications.slice(0, 6));
    }
  } catch (error) {
    res.status(500).json({ message: "Server error fetching recommendations", error: error.message });
  }
};
