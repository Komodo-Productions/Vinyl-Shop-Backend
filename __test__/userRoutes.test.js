const request = require('supertest'); // it creates real HTTP requests and responses through the network stack
const express = require('express');
const userRoutes = require('../routes/userRoutes');
const UserController = require('../controllers/userController');

jest.mock('../controllers/userController');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/users', userRoutes);

describe('User Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /', () => {
        it('should call UserController.getAll and return users successfully', async () => {
            // Arrange
            const mockUsers = [
                { id: 1, name: 'John', last_name: 'Doe', email: 'john@example.com' },
                { id: 2, name: 'Jane', last_name: 'Smith', email: 'jane@example.com' }
            ];

            UserController.getAll.mockImplementation((req, res) => {
                res.json(mockUsers);
            });

            // Act & Assert
            const response = await request(app)
                .get('/users')
                .expect(200);

            expect(UserController.getAll).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual(mockUsers);
        });

        it('should handle errors when UserController.getAll fails', async () => {
            const errorMessage = 'Database connection failed';
            
            UserController.getAll.mockImplementation((req, res) => {
                res.status(500).json({ error: errorMessage });
            });

            const response = await request(app)
                .get('/users')
                .expect(500);

            expect(UserController.getAll).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({ error: errorMessage });
        });
    });

    describe('GET /:id', () => {
        it('should call UserController.getById and return user successfully', async () => {
            const userId = '1';
            const mockUser = { id: 1, name: 'John', last_name: 'Doe', email: 'john@example.com' };

            UserController.getById.mockImplementation((req, res) => {
                res.json(mockUser);
            });

            const response = await request(app)
                .get(`/users/${userId}`)
                .expect(200);

            expect(UserController.getById).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual(mockUser);
        });

        it('should handle user not found error', async () => {
            // Arrange
            const userId = '999';
            const errorMessage = 'User not found';

            UserController.getById.mockImplementation((req, res) => {
                res.status(404).json({ error: errorMessage });
            });

            const response = await request(app)
                .get(`/users/${userId}`)
                .expect(404);

            expect(UserController.getById).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({ error: errorMessage });
        });
    });

    describe('POST /', () => {
        it('should call UserController.create and create user successfully', async () => {
            const newUserData = {
                name: 'John',
                last_name: 'Doe',
                phone: '123456789',
                email: 'john@example.com',
                password: 'password123'
            };
            const createdUser = { id: 1, ...newUserData };
            const successResponse = {
                message: 'User created successfully',
                data: createdUser
            };

            UserController.create.mockImplementation((req, res) => {
                res.status(201).json(successResponse);
            });

            const response = await request(app)
                .post('/users')
                .send(newUserData)
                .expect(201);

            expect(UserController.create).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual(successResponse);
        });

        it('should handle validation errors when creating user', async () => {
            const invalidUserData = {
                name: 'John',
                last_name: 'Doe',
                phone: '123456789',
                email: 'invalid-email',
                password: 'password123'
            };
            const errorMessage = 'Invalid email format';

            UserController.create.mockImplementation((req, res) => {
                res.status(400).json({ error: errorMessage });
            });

            const response = await request(app)
                .post('/users')
                .send(invalidUserData)
                .expect(400);

            expect(UserController.create).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({ error: errorMessage });
        });
    });

    describe('PUT /:id', () => {
        it('should call UserController.update and update user successfully', async () => {
            const userId = '1';
            const updateData = {
                name: 'John Updated',
                last_name: 'Doe Updated',
                phone: '987654321',
                email: 'john.updated@example.com',
                password: 'newpassword123'
            };
            const updatedUser = { id: 1, ...updateData };
            const successResponse = {
                message: 'User updated successfully',
                data: updatedUser
            };

            UserController.update.mockImplementation((req, res) => {
                res.json(successResponse);
            });

            const response = await request(app)
                .put(`/users/${userId}`)
                .send(updateData)
                .expect(200);

            expect(UserController.update).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual(successResponse);
        });

        it('should handle user not found when updating', async () => {
            const userId = '999';
            const updateData = {
                name: 'John',
                last_name: 'Doe',
                phone: '123456789',
                email: 'john@example.com',
                password: 'password123'
            };
            const errorMessage = 'User not found';

            UserController.update.mockImplementation((req, res) => {
                res.status(404).json({ error: errorMessage });
            });

            const response = await request(app)
                .put(`/users/${userId}`)
                .send(updateData)
                .expect(404);

            expect(UserController.update).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({ error: errorMessage });
        });
    });

    describe('DELETE /:id', () => {
        it('should call UserController.delete and delete user successfully', async () => {
            const userId = '1';
            const deletedUser = { id: 1, name: 'John', last_name: 'Doe', email: 'john@example.com' };
            const successResponse = {
                message: 'User deleted successfully',
                data: deletedUser
            };

            UserController.delete.mockImplementation((req, res) => {
                res.json(successResponse);
            });

            const response = await request(app)
                .delete(`/users/${userId}`)
                .expect(200);

            expect(UserController.delete).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual(successResponse);
        });

        it('should handle user not found when deleting', async () => {
            const userId = '999';
            const errorMessage = 'User not found';

            UserController.delete.mockImplementation((req, res) => {
                res.status(404).json({ error: errorMessage });
            });

            const response = await request(app)
                .delete(`/users/${userId}`)
                .expect(404);

            expect(UserController.delete).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({ error: errorMessage });
        });
    });

    describe('Route Integration', () => {
        it('should pass correct request parameters to controller methods', async () => {
            const userId = '123';
            UserController.getById.mockImplementation((req, res) => {
                expect(req.params.id).toBe(userId);
                res.json({ id: userId });
            });

            await request(app)
                .get(`/users/${userId}`)
                .expect(200);

            expect(UserController.getById).toHaveBeenCalledTimes(1);
        });

        it('should pass correct request body to controller methods', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com'
            };

            UserController.create.mockImplementation((req, res) => {
                expect(req.body).toEqual(userData);
                res.status(201).json({ message: 'User created successfully' });
            });

            await request(app)
                .post('/users')
                .send(userData)
                .expect(201);

            expect(UserController.create).toHaveBeenCalledTimes(1);
        });
    });
});