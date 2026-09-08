const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// POST /orders/checkout — turn a user's cart into an order
router.post('/checkout', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    // 1. Fetch cart items with product prices
    const cartResult = await pool.query(
      `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1`,
      [userId]
    );

    const items = cartResult.rows;

    // 2. Guard against checking out an empty cart
    //    (this is one of your seeded failure scenarios — try removing
    //     this check later to demonstrate a crash + auto-fix)
    if (items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty, cannot checkout' });
    }

    // 3. Compute total
    const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    // 4. Create the order
    const orderResult = await pool.query(
      'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3) RETURNING *',
      [userId, total, 'confirmed']
    );

    // 5. Clear the cart
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    res.status(201).json({
      order: orderResult.rows[0],
      items
    });
  } catch (err) {
    console.error('Error during checkout:', err.message);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

module.exports = router;