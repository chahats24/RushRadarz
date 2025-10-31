const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', menuController.getAllItems);
router.get('/:id', menuController.getItemById);

// Protected routes
router.get('/ai/recommendations', auth, menuController.getRecommendations);
router.post('/:id/rate', auth, menuController.addRating);

module.exports = router;