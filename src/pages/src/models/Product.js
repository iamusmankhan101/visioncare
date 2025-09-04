const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['Sunglasses', 'Eyeglasses', 'Reading Glasses', 'Computer Glasses']]
    }
  },
  material: {
    type: DataTypes.STRING,
    validate: {
      isIn: [['Metal', 'Plastic', 'Titanium', 'Acetate', 'Wood', 'Other']]
    }
  },
  shape: {
    type: DataTypes.STRING,
    validate: {
      isIn: [['Round', 'Square', 'Rectangle', 'Cat Eye', 'Aviator', 'Oval', 'Geometric', 'Other']]
    }
  },
  color: {
    type: DataTypes.STRING
  },
  image: {
    type: DataTypes.STRING
  },
  gallery: {
    type: DataTypes.TEXT, // Store as JSON string
    get() {
      const value = this.getDataValue('gallery');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('gallery', JSON.stringify(value));
    }
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  bestSeller: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  brand: {
    type: DataTypes.STRING
  },
  gender: {
    type: DataTypes.STRING,
    validate: {
      isIn: [['Men', 'Women', 'Unisex']]
    }
  },
  frameColor: {
    type: DataTypes.STRING
  },
  sizes: {
    type: DataTypes.TEXT, // Store as JSON string
    get() {
      const value = this.getDataValue('sizes');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('sizes', JSON.stringify(value));
    }
  },
  lensTypes: {
    type: DataTypes.TEXT, // Store as JSON string
    get() {
      const value = this.getDataValue('lensTypes');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('lensTypes', JSON.stringify(value));
    }
  },
  discount: {
    type: DataTypes.TEXT, // Store as JSON string
    get() {
      const value = this.getDataValue('discount');
      return value ? JSON.parse(value) : { isDiscounted: false, percentage: 0 };
    },
    set(value) {
      this.setDataValue('discount', JSON.stringify(value));
    }
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'In Stock',
    validate: {
      isIn: [['In Stock', 'Out of Stock', 'Coming Soon']]
    }
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true, // This will add createdAt and updatedAt fields
});

module.exports = Product;