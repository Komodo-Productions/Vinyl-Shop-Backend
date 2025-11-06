// __tests__/AuthRoutes.test.js
const express = require('express');
const request = require('supertest');
const router = require('../routes/authRoutes');
const AuthController = require('../controllers/authController');

jest.mock('../controllers/authController');

const app = express();
app.use(express.json());
app.use('/auth', router);

describe('Auth Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  it('POST /auth/register should call register controller', async () => {
    AuthController.register.mockImplementation((req, res) =>
      res.status(201).json({ message: 'registered' })
    );

    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'John', last_name: 'Doe', email: 'john@example.com', password: '1234' });

    expect(AuthController.register).toHaveBeenCalled();
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ message: 'registered' });
  });

  it('POST /auth/login should call login controller', async () => {
    AuthController.login.mockImplementation((req, res) =>
      res.status(200).json({ message: 'logged in' })
    );

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'john@example.com', password: '1234' });

    expect(AuthController.login).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'logged in' });
  });
});
