require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');

const authRoutes        = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const summaryRoutes     = require('./routes/summary');
const categoryRoutes    = require('./routes/categories');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth',         authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/summary',      summaryRoutes);
app.use('/api/categories',   categoryRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Expense Tracker API is running',
    version: '1.0.0',
    endpoints: {
      auth:         '/api/auth',
      transactions: '/api/transactions',
      summary:      '/api/summary',
      categories:   '/api/categories',
    },
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;