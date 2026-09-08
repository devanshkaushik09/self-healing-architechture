const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET /products — list all products
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /products/:id — get a single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching product:', err.message);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /products — create a new product
router.post('/', async (req, res) => {
  try {
    const { name, price, quantity } = req.body;

    // Basic input validation (this is one of your seeded-bug injection points later —
    // e.g. removing this check on purpose to demo a failure scenario)
    if (!name || typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'name (string) and price (positive number) are required' });
    }

    const result = await pool.query(
      'INSERT INTO products (name, price, quantity) VALUES ($1, $2, $3) RETURNING *',
      [name, price, quantity || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating product:', err.message);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

module.exports = router;