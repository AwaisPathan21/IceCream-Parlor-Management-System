const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET /api/orders/addresses - get user addresses
router.get('/addresses', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC', [req.user.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/orders/addresses - save new address
router.post('/addresses', auth, async (req, res) => {
  const { label, address_line, city, pincode, is_default } = req.body;
  if (!address_line || !city || !pincode) return res.status(400).json({ error: 'Address, city and pincode required.' });
  try {
    if (is_default) {
      await db.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [req.user.id]);
    }
    const [result] = await db.query(
      'INSERT INTO addresses (user_id, label, address_line, city, pincode, is_default) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, label || 'Home', address_line, city, pincode, is_default ? 1 : 0]
    );
    const [rows] = await db.query('SELECT * FROM addresses WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/orders/addresses/:id
router.delete('/addresses/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Address deleted.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/orders - place order
router.post('/', auth, async (req, res) => {
  const { address_id, delivery_address, items, payment_method, notes } = req.body;
  if (!delivery_address || !items || items.length === 0 || !payment_method) {
    return res.status(400).json({ error: 'Address, items and payment method required.' });
  }
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const total = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const payment_status = payment_method === 'cod' ? 'pending' : 'paid';
    const [orderResult] = await conn.query(
      'INSERT INTO orders (user_id, address_id, delivery_address, total_amount, payment_method, payment_status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, address_id || null, delivery_address, total, payment_method, payment_status, notes || null]
    );
    const orderId = orderResult.insertId;
    for (const item of items) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.id, item.name, item.quantity, item.price]
      );
    }
    await conn.commit();
    res.status(201).json({
      message: 'Order placed successfully! 🎉',
      order_id: orderId,
      total_amount: total,
      estimated_delivery: '10 minutes',
      payment_status
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// GET /api/orders/my - get user's orders
router.get('/my', auth, async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );
    for (const order of orders) {
      const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      order.items = items;
    }
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/orders/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (orders.length === 0) return res.status(404).json({ error: 'Order not found.' });
    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
    orders[0].items = items;
    res.json(orders[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
