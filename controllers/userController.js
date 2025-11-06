const UserService = require('../services/userService');

class UserController {
    static async getAll(req, res) {
        try {
            const users = await UserService.getUsers();
            res.json(users);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async getById(req, res) {
        try {
            const user = await UserService.getUserById(req.params.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async getUserByEmail(req, res) {
        try {
            const { email } = req.params;
            const user = await UserService.findByEmail(email);

            if (!user) {
                return res.status(404).json({ message: 'user not found' });
            }
            const user_id = user.id_user;
            
            return res.json(user_id);
        } catch (error) {
            console.error('Error al obtener usuario por email:', error);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }

    static async create(req, res) {
        try {
            const newUser = {
                name: req.body.name,
                last_name: req.body.last_name,
                phone: req.body.phone,
                email: req.body.email,
                password: req.body.password
            };

            const createdUser = await UserService.createUser(newUser);
            res.status(201).json({ message: 'User created successfully', data: createdUser });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { name, last_name, phone, email, password } = req.body;

            const updatedUser = await UserService.updateUser(id, {
                name,
                last_name,
                phone,
                email,
                password
            });

            if (!updatedUser) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({ message: 'User updated successfully', data: updatedUser });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedUser = await UserService.deleteUser(id);

            if (!deletedUser) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({ message: 'User deleted successfully', data: deletedUser });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = UserController;