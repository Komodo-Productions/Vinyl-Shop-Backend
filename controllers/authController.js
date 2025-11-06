const { loginUser, registerUser } = require('../services/authService');
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/jwt");

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUser(email, password);

    // Configurar cookie
    res.cookie('token', token, {
      httpOnly: true,     
      secure: false,      
      sameSite: 'lax',   
      maxAge: 3600000,
      path: "/",    
    });

    res.status(200).json({
      success: true,
      message: "Inicio de sesión exitoso",
      user: {
        id: user.id_usuario,
        nombre: user.nombre,
        email: user.email
      },
      token
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

async function register(req, res) {
  try {
    console.log("REQ BODY:", req.body);
    const { name, last_name, phone, email, password } = req.body;

    // Validar que todos los campos requeridos estén presentes
    if (!name || !last_name || !email || !password) {
      return res.status(400).json({ success: false, message: "Faltan campos requeridos" });
    }

    const newUser = await registerUser(name, last_name, phone, email, password);

    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      user: {
        id: newUser.id,
        name: newUser.name,
        last_name: newUser.last_name,
        phone: newUser.phone,
        email: newUser.email,
      },
      token: newUser.token
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  });
  res.status(200).json({ success: true, message: 'Sesión cerrada correctamente' });
}

function checkAuth(req, res) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ success: false, message: 'No autenticado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ success: true, user: decoded });
  } catch (err) {
  console.error("Error al verificar token:", err.message);
  res.status(401).json({ success: false, message: 'Token inválido o expirado' });
  }

  
}

module.exports = { login, register, logout, checkAuth };


