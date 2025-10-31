const MenuItem = require('../models/MenuItem');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get all menu items
exports.getAllItems = async (req, res) => {
  try {
    const { category, cuisine, spiceLevel } = req.query;
    let query = {};

    if (category) query.category = category;
    if (cuisine) query.cuisine = cuisine;
    if (spiceLevel) query.spiceLevel = spiceLevel;

    const menuItems = await MenuItem.find(query);
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu items', error: error.message });
  }
};

// Get menu item by ID
exports.getItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu item', error: error.message });
  }
};

// Get AI recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const user = req.user;
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Create context from user preferences and allergies
    const context = {
      preferences: user.preferences,
      allergies: user.allergies,
      orderHistory: await user.populate('orderHistory').orderHistory
    };

    // Generate prompt for AI
    const prompt = `Based on this user's preferences and allergies:
      Preferences: ${JSON.stringify(context.preferences)}
      Allergies: ${JSON.stringify(context.allergies)}
      Recent orders: ${JSON.stringify(context.orderHistory.slice(-5))}
      
      Suggest 5 menu items they might enjoy, considering their dietary restrictions and past orders.`;

    // Get AI response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Parse AI suggestions and match with actual menu items
    const suggestions = response.text();
    
    // Find matching menu items from the database
    const recommendedItems = await MenuItem.find({
      $and: [
        { allergens: { $nin: user.allergies } },
        { 
          $or: [
            { cuisine: { $in: user.preferences.cuisine } },
            { spiceLevel: user.preferences.spiceLevel }
          ]
        }
      ]
    }).limit(5);

    res.json({
      aiSuggestions: suggestions,
      recommendedItems
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting recommendations', error: error.message });
  }
};

// Add rating to menu item
exports.addRating = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    menuItem.ratings.push({
      user: req.user._id,
      rating,
      review
    });

    await menuItem.save();
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: 'Error adding rating', error: error.message });
  }
};