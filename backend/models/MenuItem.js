const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  cuisine: {
    type: String,
    required: true
  },
  preparationTime: {
    type: Number, // in minutes
    required: true,
    min: 0
  },
  allergens: [{
    type: String,
    trim: true
  }],
  spiceLevel: {
    type: String,
    enum: ['mild', 'medium', 'hot'],
    default: 'medium'
  },
  image: {
    type: String, // URL to image
    default: 'default-food-image.jpg'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  dietaryInfo: [{
    type: String,
    trim: true
  }],
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String
  }]
}, {
  timestamps: true
});

// Calculate average rating
menuItemSchema.virtual('averageRating').get(function() {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, curr) => acc + curr.rating, 0);
  return sum / this.ratings.length;
});

module.exports = mongoose.model('MenuItem', menuItemSchema);