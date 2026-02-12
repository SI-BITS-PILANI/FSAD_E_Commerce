const express = require('express');
const router = express.Router();
const { Order, OrderItem, Product, User, sequelize } = require('../models');
const { auth } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', auth, async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { items, shippingAddress, paymentMethod, transactionId } = req.body;
    
    if (!items || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Order must contain at least one item' 
      });
    }
    
    // Calculate total amount and verify product availability
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      
      if (!product) {
        await t.rollback();
        return res.status(404).json({ 
          success: false, 
          message: `Product ${item.productId} not found` 
        });
      }
      
      if (product.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for product: ${product.name}` 
        });
      }
      
      const itemTotal = parseFloat(product.price) * item.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      });
      
      // Update product stock
      await product.update({ stock: product.stock - item.quantity }, { transaction: t });
    }
    
    // Create order
    const order = await Order.create({
      userId: req.user.id,
      totalAmount,
      shippingAddress,
      paymentMethod,
      transactionId,
      paymentStatus: transactionId ? 'Completed' : 'Pending'
    }, { transaction: t });
    
    // Create order items
    for (const item of orderItems) {
      await OrderItem.create({
        orderId: order.id,
        ...item
      }, { transaction: t });
    }
    
    await t.commit();
    
    // Fetch complete order with items and products
    const completeOrder = await Order.findByPk(order.id, {
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'image']
        }]
      }]
    });
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: completeOrder
    });
  } catch (error) {
    if (t && !t.finished) {
      await t.rollback();
    }
    console.error('Create order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating order' 
    });
  }
});

// @route   GET /api/orders
// @desc    Get all orders for logged in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'image']
        }]
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching orders' 
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'image', 'price']
          }]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    // Check if order belongs to user
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view this order' 
      });
    }
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching order' 
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Private/Admin
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update order status' 
      });
    }
    
    const { orderStatus } = req.body;
    
    const order = await Order.findByPk(req.params.id, {
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'image']
        }]
      }]
    });
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    await order.update({ orderStatus });
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating order status' 
    });
  }
});

module.exports = router;
