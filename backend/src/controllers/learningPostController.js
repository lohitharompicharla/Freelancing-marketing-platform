import LearningPost from "../models/LearningPost.js";
import { isMongoConnected } from "../config/db.js";
import { demoDb } from "../services/demoStore.js";

// @desc    Get all learning posts
// @route   GET /api/learning-posts
// @access  Public
export const getLearningPosts = async (req, res) => {
  try {
    const { domain, level, provider, search, limit = 10, page = 1 } = req.query;
    
    // Convert limit and page to numbers
    const limitNum = parseInt(limit, 10);
    const pageNum = parseInt(page, 10);
    const skip = (pageNum - 1) * limitNum;

    if (isMongoConnected()) {
      const query = { isApproved: true };
      if (domain) query.domain = domain;
      if (level) query.level = level;
      if (provider) query.provider = provider;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { tags: { $regex: search, $options: "i" } }
        ];
      }

      const total = await LearningPost.countDocuments(query);
      const posts = await LearningPost.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      res.json({
        posts,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        total
      });
    } else {
      let posts = await demoDb.learningPosts.findAll();
      posts = posts.filter(p => p.isApproved);

      if (domain) posts = posts.filter(p => p.domain === domain);
      if (level) posts = posts.filter(p => p.level === level);
      if (provider) posts = posts.filter(p => p.provider === provider);
      if (search) {
        const lowerSearch = search.toLowerCase();
        posts = posts.filter(p => 
          p.title.toLowerCase().includes(lowerSearch) || 
          p.tags.some(t => t.toLowerCase().includes(lowerSearch))
        );
      }

      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      const total = posts.length;
      const paginatedPosts = posts.slice(skip, skip + limitNum);

      res.json({
        posts: paginatedPosts,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        total
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error fetching learning posts", error: error.message });
  }
};

// @desc    Get learning post by ID
// @route   GET /api/learning-posts/:id
// @access  Public
export const getLearningPostById = async (req, res) => {
  try {
    let post;
    if (isMongoConnected()) {
      post = await LearningPost.findOne({ _id: req.params.id, isApproved: true });
    } else {
      post = await demoDb.learningPosts.findById(req.params.id);
      if (post && !post.isApproved) post = null;
    }

    if (!post) {
      return res.status(404).json({ message: "Learning post not found" });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching learning post", error: error.message });
  }
};

// @desc    Get learning recommendations
// @route   GET /api/learning-recommendations
// @access  Public
export const getLearningRecommendations = async (req, res) => {
  try {
    const { domain, level = "Beginner" } = req.query;

    if (isMongoConnected()) {
      const query = { isApproved: true, level };
      if (domain) query.domain = domain;

      const recommendations = await LearningPost.find(query)
        .sort({ createdAt: -1 })
        .limit(6);

      // If we don't have enough with domain filter, fallback to just level
      if (recommendations.length < 6 && domain) {
        const fallbackQuery = { isApproved: true, level, _id: { $nin: recommendations.map(r => r._id) } };
        const fallback = await LearningPost.find(fallbackQuery)
          .sort({ createdAt: -1 })
          .limit(6 - recommendations.length);
        
        recommendations.push(...fallback);
      }

      res.json(recommendations);
    } else {
      let posts = await demoDb.learningPosts.findAll();
      posts = posts.filter(p => p.isApproved && p.level === level);
      
      let recommendations = [];
      if (domain) {
        recommendations = posts.filter(p => p.domain === domain);
      }
      
      recommendations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      if (recommendations.length < 6) {
        const otherPosts = posts
          .filter(p => p.domain !== domain)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        recommendations = [...recommendations, ...otherPosts].slice(0, 6);
      } else {
        recommendations = recommendations.slice(0, 6);
      }

      res.json(recommendations);
    }
  } catch (error) {
    res.status(500).json({ message: "Server error fetching learning recommendations", error: error.message });
  }
};
