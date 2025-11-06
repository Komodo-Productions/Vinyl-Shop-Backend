const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt');
const UserModel = require('../models/userModel');

async function registerUser(name, last_name, phone, email, password) {
  // Verificar si el usuario ya existe
  const existingUser = await UserModel.findByEmail(email);
  if (existingUser) throw new Error('El correo ya está registrado.');

  // Encriptar la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Contraseña hasheada", hashedPassword);
  // Crear el nuevo usuario
  const createdUser = await UserModel.create({
    name,
    last_name,
    phone,
    email,
    password: hashedPassword,
  });

  // createdUser debería ser el objeto completo del usuario 
  if (!createdUser || !createdUser.id_user) {
    throw new Error('Error al crear el usuario: respuesta inesperada del modelo');
  }
  console.log("Vamos bien")

  // Generar token JWT con el id correcto
  const token = jwt.sign({ id: createdUser.id_user, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  // Devuelve el usuario y token 
  return {
    id: createdUser.id_user,
    name: createdUser.name,
    last_name: createdUser.last_name,
    phone: createdUser.phone,
    email: createdUser.email,
    token
  };
}

async function loginUser(email, password) {
  const user = await UserModel.findByEmail(email);
  if (!user) throw new Error('Usuario no encontrado');

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) throw new Error('Contraseña incorrecta');

  const token = jwt.sign(
    { id: user.id_usuario, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return { user, token };
}

module.exports = { loginUser, registerUser };

