require('dotenv').config(); // Add this at the top
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Use environment variable
  credentials: true,              // permite enviar cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check endpoint for ECS
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rutas
const userRoutes = require('./routes/userRoutes');
const orderHeaderRoutes = require('./routes/orderHeaderRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); 
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const { verifyToken } = require('./middleware/authMiddleware');

// Rutas protegidas
app.use('/api/users', verifyToken, userRoutes);
app.use('/api/orders', verifyToken, orderHeaderRoutes);
app.use('/api/payments', verifyToken, paymentRoutes);

// Rutas públicas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Use environment variable for port (required for ECS)
const PORT = process.env.PORT || 4000;

// Levantar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running at http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});
