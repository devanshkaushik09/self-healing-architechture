require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Health check endpoint — the watchdog and deploy-verification step
// will hit this to confirm the app is alive.
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`MiniCart app listening on port ${PORT}`);
});

module.exports = app;