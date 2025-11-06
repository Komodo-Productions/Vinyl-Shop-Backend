const UserController = require('../controllers/userController');
const UserService = require('../services/userService');

// Mock the UserService module
jest.mock('../services/userService');

describe('UserController', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // these setup the mock request and response objects
        req = {
            params: {},
            body: {}
        };
        
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
    });

    describe('getAll', () => {
        it('should return all users successfully', async () => {
            // Arrange
            const mockUsers = [
                { id: 1, name: 'John', last_name: 'Doe', email: 'john@example.com' },
                { id: 2, name: 'Jane', last_name: 'Smith', email: 'jane@example.com' }
            ];
            UserService.getUsers.mockResolvedValue(mockUsers);

            // Act
            await UserController.getAll(req, res);

            // Assert
            expect(UserService.getUsers).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith(mockUsers);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should handle errors when getting all users fails', async () => {
            const errorMessage = 'Database connection failed';
            UserService.getUsers.mockRejectedValue(new Error(errorMessage));

            await UserController.getAll(req, res);

            expect(UserService.getUsers).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
        });
    });

    describe('getById', () => {
        it('should return user by id successfully', async () => {
            const userId = '1';
            const mockUser = { id: 1, name: 'John', last_name: 'Doe', email: 'john@example.com' };
            req.params.id = userId;
            UserService.getUserById.mockResolvedValue(mockUser);

            await UserController.getById(req, res);

            expect(UserService.getUserById).toHaveBeenCalledWith(userId);
            expect(res.json).toHaveBeenCalledWith(mockUser);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should return 404 when user is not found', async () => {
            const userId = '999';
            req.params.id = userId;
            UserService.getUserById.mockResolvedValue(null);

            await UserController.getById(req, res);

            expect(UserService.getUserById).toHaveBeenCalledWith(userId);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
        });
    });

     describe('getUserByEmail', () => {
        it('should return user by email successfully', async () => {
            const userEmail = 'john@example.com';
            const mockUser = { id_user: 1, name: 'John', last_name: 'Doe', email: 'john@example.com' };
            req.params.email = userEmail;
            UserService.findByEmail.mockResolvedValue(mockUser);

            await UserController.getUserByEmail(req, res);

            expect(UserService.findByEmail).toHaveBeenCalledWith(userEmail);
            expect(res.json).toHaveBeenCalledWith(mockUser.id_user);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should return 404 when user is not found', async () => {
            const userEmail = 'notjhonsemail@example.com';
            req.params.email = userEmail;
            UserService.findByEmail.mockResolvedValue(null);

            await UserController.getUserByEmail(req, res);

            expect(UserService.findByEmail).toHaveBeenCalledWith(userEmail);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'user not found' });
        });
    });

    describe('create', () => {
        it('should create user successfully', async () => {
            const newUserData = {
                name: 'John',
                last_name: 'Doe',
                phone: '123456789',
                email: 'john@example.com',
                password: 'password123'
            };
            const createdUser = { id: 1, ...newUserData };
            req.body = newUserData;
            UserService.createUser.mockResolvedValue(createdUser);

            await UserController.create(req, res);

            expect(UserService.createUser).toHaveBeenCalledWith(newUserData);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User created successfully',
                data: createdUser
            });
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
            req.body = invalidUserData;
            UserService.createUser.mockRejectedValue(new Error(errorMessage));

            await UserController.create(req, res);

            expect(UserService.createUser).toHaveBeenCalledWith(invalidUserData);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
        });
    });

    describe('update', () => {
        it('should update user successfully', async () => {
            const userId = '1';
            const updateData = {
                name: 'John Updated',
                last_name: 'Doe Updated',
                phone: '987654321',
                email: 'john.updated@example.com',
                password: 'newpassword123'
            };
            const updatedUser = { id: 1, ...updateData };
            req.params.id = userId;
            req.body = updateData;
            UserService.updateUser.mockResolvedValue(updatedUser);

            await UserController.update(req, res);

            expect(UserService.updateUser).toHaveBeenCalledWith(userId, updateData);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User updated successfully',
                data: updatedUser
            });
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should return 404 when updating non-existent user', async () => {
            const userId = '999';
            const updateData = {
                name: 'John',
                last_name: 'Doe',
                phone: '123456789',
                email: 'john@example.com',
                password: 'password123'
            };
            req.params.id = userId;
            req.body = updateData;
            UserService.updateUser.mockResolvedValue(null);

            await UserController.update(req, res);

            expect(UserService.updateUser).toHaveBeenCalledWith(userId, updateData);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
        });
    });

    describe('delete', () => {
        it('should delete user successfully', async () => {
            const userId = '1';
            const deletedUser = { id: 1, name: 'John', last_name: 'Doe', email: 'john@example.com' };
            req.params.id = userId;
            UserService.deleteUser.mockResolvedValue(deletedUser);

            await UserController.delete(req, res);

            expect(UserService.deleteUser).toHaveBeenCalledWith(userId);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User deleted successfully',
                data: deletedUser
            });
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should return 404 when deleting non-existent user', async () => {
            const userId = '999';
            req.params.id = userId;
            UserService.deleteUser.mockResolvedValue(null);

            await UserController.delete(req, res);

            expect(UserService.deleteUser).toHaveBeenCalledWith(userId);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
        });
    });
});