const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// POST /cart/add — add an item to a user's cart
router.post('/add', async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || !quantity) {
      return res.status(400).json({ error: 'userId, productId, and quantity are required' });
    }

    const result = await pool.query(
      'INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
      [userId, productId, quantity]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding to cart:', err.message);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// GET /cart/:userId — view a user's cart with computed total
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1`,
      [userId]
    );

    const items = result.rows;
    const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    res.status(200).json({ userId, items, total });
  } catch (err) {
    console.error('Error fetching cart:', err.message);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

module.exports = router;