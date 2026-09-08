require('dotenv').config();
const express = require('express');
const pool = require('./db/pool');

const app = express();
app.use(express.json());

const productsRouter = require('./routes/products');
app.use('/products', productsRouter);

const PORT = process.env.PORT || 3000;

// Health check endpoint — the watchdog and deploy-verification step
// will hit this to confirm the app is alive.
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected', error: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`MiniCart app listening on port ${PORT}`);
});

module.exports = app;