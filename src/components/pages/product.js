const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Sunglasses', 'Eyeglasses', 'Reading Glasses', 'Computer Glasses']
  },
  material: {
    type: String,
    enum: ['Metal', 'Plastic', 'Titanium', 'Acetate', 'Wood', 'Other']
  },
  shape: {
    type: String,
    enum: ['Round', 'Square', 'Rectangle', 'Cat Eye', 'Aviator', 'Oval', 'Geometric', 'Other']
  },
  color: {
    type: String
  },
  image: {
    type: String
  },
  gallery: [{
    type: String
  }],
  featured: {
    type: Boolean,
    default: false
  },
  bestSeller: {
    type: Boolean,
    default: false
  },
  brand: {
    type: String
  },
  gender: {
    type: String,
    enum: ['Men', 'Women', 'Unisex']
  },
  frameColor: {
    type: String
  },
  sizes: [{
    type: String
  }],
  lensTypes: [{
    type: String
  }],
  discount: {
    isDiscounted: {
      type: Boolean,
      default: false
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['In Stock', 'Out of Stock', 'Coming Soon'],
    default: 'In Stock'
  },
  description: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);