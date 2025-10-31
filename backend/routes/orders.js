const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

router.post('/', orderController.createOrder);
router.get('/user', orderController.getUserOrders);
router.get('/:id', orderController.getOrderStatus);
router.post('/:id/cancel', orderController.cancelOrder);

module.exports = router;