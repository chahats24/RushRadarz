const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const { items, specialInstructions, userId } = req.body;
    
    // Verify if ordering for self or friend
    let orderUser = req.user._id;
    if (userId) {
      const friend = await User.findById(userId);
      if (!friend || !req.user.friends.includes(friend._id)) {
        return res.status(403).json({ message: 'Not authorized to order for this user' });
      }
      orderUser = friend._id;
    }

    // Calculate total amount and verify items
    let totalAmount = 0;
    const verifiedItems = [];
    
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem || !menuItem.isAvailable) {
        return res.status(400).json({ message: `Item ${item.menuItem} is not available` });
      }
      
      totalAmount += menuItem.price * item.quantity;
      verifiedItems.push({
        menuItem: item.menuItem,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions
      });
    }

    // Calculate estimated delivery time
    const now = new Date();
    const order = new Order({
      user: orderUser,
      orderedBy: req.user._id,
      items: verifiedItems,
      totalAmount,
      estimatedDeliveryTime: now,
      status: 'pending'
    });

    // Calculate total preparation time
    const prepTime = await order.calculateEstimatedTime();
    order.estimatedDeliveryTime.setMinutes(
      order.estimatedDeliveryTime.getMinutes() + prepTime
    );

    await order.save();
    await order.updateQueuePosition();

    // Update user's order history
    await User.findByIdAndUpdate(orderUser, {
      $push: { orderHistory: order._id }
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

// Get order status
exports.getOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.menuItem')
      .populate('user', 'username')
      .populate('orderedBy', 'username');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify user has permission to view this order
    if (order.user.toString() !== req.user._id.toString() && 
        order.orderedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    await order.updateQueuePosition();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        { user: req.user._id },
        { orderedBy: req.user._id }
      ]
    })
      .populate('items.menuItem')
      .populate('user', 'username')
      .populate('orderedBy', 'username')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify user has permission to cancel this order
    if (order.user.toString() !== req.user._id.toString() && 
        order.orderedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    // Only allow cancellation of pending orders
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot cancel order in current status' });
    }

    order.status = 'cancelled';
    await order.save();

    // Update queue positions for other orders
    const pendingOrders = await Order.find({
      status: { $in: ['pending', 'preparing'] }
    });

    for (const pendingOrder of pendingOrders) {
      await pendingOrder.updateQueuePosition();
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling order', error: error.message });
  }
};