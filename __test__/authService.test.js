// __tests__/AuthService.test.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { loginUser, registerUser } = require('../services/authService');

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../models/userModel');

describe('AuthService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id_user: 1,
        name: 'John',
        last_name: 'Doe',
        phone: '555',
        email: 'john@example.com',
        password: 'hashed123'
      };

      UserModel.findByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed123');
      UserModel.create.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('fake-jwt');

      const result = await registerUser('John', 'Doe', '555', 'john@example.com', 'plain');

      expect(UserModel.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('plain', 10);
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1, email: 'john@example.com' },
        expect.any(String),
        { expiresIn: expect.any(String) }
      );
      expect(result).toEqual({
        id: 1,
        name: 'John',
        last_name: 'Doe',
        phone: '555',
        email: 'john@example.com',
        token: 'fake-jwt'
      });
    });

    it('should throw error if email already exists', async () => {
      UserModel.findByEmail.mockResolvedValue({ id_user: 1 });

      await expect(
        registerUser('John', 'Doe', '555', 'john@example.com', 'plain')
      ).rejects.toThrow('El correo ya está registrado.');
    });
  });

  describe('loginUser', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id_usuario: 1,
        email: 'john@example.com',
        password: 'hashedpw'
      };

      UserModel.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('jwt-token');

      const result = await loginUser('john@example.com', 'plain');

      expect(UserModel.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('plain', 'hashedpw');
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toEqual({ user: mockUser, token: 'jwt-token' });
    });

    it('should throw error if user not found', async () => {
      UserModel.findByEmail.mockResolvedValue(null);

      await expect(
        loginUser('notfound@example.com', 'plain')
      ).rejects.toThrow('Usuario no encontrado');
    });

    it('should throw error if password is incorrect', async () => {
      UserModel.findByEmail.mockResolvedValue({ email: 'john@example.com', password: 'hashed' });
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        loginUser('john@example.com', 'wrong')
      ).rejects.toThrow('Contraseña incorrecta');
    });
  });
});
