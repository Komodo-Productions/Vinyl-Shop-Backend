const express = require('express');
const router = express.Router();
const { login, register, logout, checkAuth } = require('../controllers/authController');

// Registro de usuario
router.post('/register', register);

// Inicio de sesión
router.post('/login', login);

//cerrar sesión
router.post('/logout', logout);

router.get('/check', checkAuth);

module.exports = router;
