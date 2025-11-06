const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

const verifyToken = (req, res, next) => {
  const token = req.cookies.token; // traemos el token de la cookie

  if (!token) {
    return res.status(403).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Error al verificar token:', err.message);
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

module.exports = { verifyToken };

