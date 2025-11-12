// __tests__/AuthController.test.js
const { login, register } = require('../controllers/authController');
const AuthService = require('../services/authService');

jest.mock('../services/authService');

describe('AuthController', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      // <-- Aquí está la corrección: mockeamos cookie y lo hacemos chainable
      cookie: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully and return user with token', async () => {
      req.body = { email: 'john@example.com', password: '12345' };

      const mockUser = {
        id_usuario: 1,
        nombre: 'John',
        email: 'john@example.com',
      };

      const mockToken = 'fake-jwt-token';
      AuthService.loginUser.mockResolvedValue({ user: mockUser, token: mockToken });

      await login(req, res);

      expect(AuthService.loginUser).toHaveBeenCalledWith('john@example.com', '12345');
      expect(res.cookie).toHaveBeenCalledWith('token', mockToken, expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Inicio de sesión exitoso",
        user: {
          id: mockUser.id_usuario,
          nombre: mockUser.nombre,
          email: mockUser.email
        },
        token: mockToken
      });
    });

    it('should return 400 if service throws an error', async () => {
      req.body = { email: 'wrong@example.com', password: 'bad' };
      AuthService.loginUser.mockRejectedValue(new Error('Usuario no encontrado'));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no encontrado'
      });
    });
  });

  describe('register', () => {
    it('should register successfully and return new user', async () => {
      req.body = {
        name: 'John',
        last_name: 'Doe',
        phone: '555-1234',
        email: 'john@example.com',
        password: 'password123'
      };

      const newUser = {
        id: 1,
        name: 'John',
        last_name: 'Doe',
        phone: '555-1234',
        email: 'john@example.com',
        token: 'fake-token'
      };

      AuthService.registerUser.mockResolvedValue(newUser);

      await register(req, res);

      expect(AuthService.registerUser).toHaveBeenCalledWith(
        'John', 'Doe', '555-1234', 'john@example.com', 'password123'
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Usuario registrado exitosamente",
        user: {
          id: newUser.id,
          name: newUser.name,
          last_name: newUser.last_name,
          phone: newUser.phone,
          email: newUser.email
        },
        token: newUser.token
      });
    });

    it('should return 400 if required fields are missing', async () => {
      req.body = { email: 'missing@example.com', password: '123' };

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Faltan campos requeridos'
      });
    });
  });
});
