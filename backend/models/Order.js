const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    specialInstructions: String
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  estimatedDeliveryTime: {
    type: Date,
    required: true
  },
  actualDeliveryTime: Date,
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  queuePosition: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate total preparation time
orderSchema.methods.calculateEstimatedTime = async function() {
  let totalTime = 0;
  for (const item of this.items) {
    const menuItem = await mongoose.model('MenuItem').findById(item.menuItem);
    totalTime += menuItem.preparationTime * item.quantity;
  }
  return totalTime; // Returns time in minutes
};

// Update queue position
orderSchema.methods.updateQueuePosition = async function() {
  const pendingOrders = await mongoose.model('Order')
    .find({
      status: { $in: ['pending', 'preparing'] },
      createdAt: { $lt: this.createdAt }
    })
    .count();
  this.queuePosition = pendingOrders + 1;
  await this.save();
};

module.exports = mongoose.model('Order', orderSchema);