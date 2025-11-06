const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,              // permite enviar cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

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

// Levantar servidor
app.listen(4000, () => console.log('Server is running at http://localhost:4000'));



