const UserModel = require('../models/userModel');

class UserService {
    static async getUsers() {
        try {
            return await UserModel.findAll();
        } catch (error) {
            throw new Error(`Error fetching users: ${error.message}`);
        }
    }

    static async getUserById(id) {
        try {
            if (!id) {
                throw new Error('User ID is required');
            }
            
            const user = await UserModel.findById(id);
            return user || null;
        } catch (error) {
            throw new Error(`Error fetching user: ${error.message}`);
        }
    }

    static async findByEmail(email) {
        try {
            return await UserModel.findByEmail(email);
        } catch (error) {
            throw new Error(`Error fetching user by email: ${error.message}`);
        }
    }

    static async createUser({ name, last_name, phone, email, password }) {
        try {
            // Validate required fields
            if (!name || !last_name || !email || !password) {
                throw new Error('Name, last name, email, and password are required fields');
            }

            // Validate email format
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                throw new Error('Invalid email format');
            }

            // Check if email already exists
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                throw new Error('Email already exists');
            }

            // Validate password length
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            const createdUser = await UserModel.create({ 
                name, 
                last_name, 
                phone, 
                email, 
                password 
            });

            return createdUser;
        } catch (error) {
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    static async updateUser(id, { name, last_name, phone, email, password }) {
        try {
            if (!id) {
                throw new Error('User ID is required for update');
            }
            
            // Check if user exists
            const existingUser = await UserModel.findById(id);
            if (!existingUser) {
                return null;
            }

            // If email is being updated, check for duplicates
            if (email && email !== existingUser.email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    throw new Error('Invalid email format');
                }

                const duplicateEmail = await UserModel.findByEmail(email);
                if (duplicateEmail) {
                    throw new Error('Email already exists');
                }
            }

            // Validate password if provided
            if (password && password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            const updated = await UserModel.update(id, { 
                name, 
                last_name, 
                phone, 
                email, 
                password 
            });

            if (!updated) {
                throw new Error('Failed to update user');
            }

            return await UserModel.findById(id);
        } catch (error) {
            throw new Error(`Error updating user: ${error.message}`);
        }
    }

    static async deleteUser(id) {
        try {
            if (!id) {
                throw new Error('User ID is required for delete');
            }
            
            const existingUser = await UserModel.findById(id);
            if (!existingUser) {
                return null;
            }
            
            const deleted = await UserModel.softDelete(id);
            if (!deleted) {
                throw new Error('Failed to delete user');
            }
            
            return existingUser;
        } catch (error) {
            throw new Error(`Error deleting user: ${error.message}`);
        }
    }

    static async hardDeleteUser(id) {
        try {
            if (!id) {
                throw new Error('User ID is required for hard delete');
            }
            
            const existingUser = await UserModel.findById(id);
            if (!existingUser) {
                return null;
            }
            
            const deleted = await UserModel.hardDelete(id);
            if (!deleted) {
                throw new Error('Failed to permanently delete user');
            }
            
            return existingUser;
        } catch (error) {
            throw new Error(`Error permanently deleting user: ${error.message}`);
        }
    }
}

module.exports = UserService;