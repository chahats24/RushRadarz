const express = require('express');
const router = express.Router();

// Simple in-memory group orders store
const groupOrders = [];

// Create a group order
router.post('/create', (req, res) => {
  const { restaurant, creatorName, items } = req.body || {};
  if(!restaurant || !creatorName) return res.status(400).json({ message: 'restaurant and creatorName required' });

  const newOrder = {
    id: Date.now().toString(),
    restaurant,
    creatorName,
    members: [{ name: creatorName, id: `u-${Date.now()}` }],
    items: items || [],
    status: 'open',
    createdAt: new Date().toISOString()
  };
  groupOrders.push(newOrder);
  res.json(newOrder);
});

// Join a group order
router.post('/:id/join', (req, res) => {
  const { id } = req.params;
  const { name } = req.body || {};
  const order = groupOrders.find(o => o.id === id);
  if(!order) return res.status(404).json({ message: 'group order not found' });
  if(!name) return res.status(400).json({ message: 'name required to join' });
  if(order.members.some(m => m.name === name)) return res.status(400).json({ message: 'already a member' });
  const member = { id: `u-${Date.now()}`, name };
  order.members.push(member);
  res.json(order);
});

// Leave / cancel
router.post('/:id/leave', (req, res) => {
  const { id } = req.params;
  const { name } = req.body || {};
  const idx = groupOrders.findIndex(o => o.id === id);
  if(idx === -1) return res.status(404).json({ message: 'group order not found' });
  const order = groupOrders[idx];
  order.members = order.members.filter(m => m.name !== name);
  if(order.members.length === 0) {
    groupOrders.splice(idx,1);
    return res.json({ message: 'group order cancelled' });
  }
  res.json(order);
});

// List active group orders
router.get('/', (req, res) => {
  res.json(groupOrders.slice().reverse());
});

module.exports = router;
