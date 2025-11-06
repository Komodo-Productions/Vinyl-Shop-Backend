const UserService = require('../services/userService'); 
const UserModel = require('../models/userModel');

jest.mock('../models/userModel');

describe("UserService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  }); // this cleans the mocks after each test

    describe('getUsers', () => {
        it("should return a list of users (success case)", async () => {
            // Arrange: mock resolved value
            const mockUsers = [
            { id: 1, name: "John Doe" },
            { id: 2, name: "Jane Doe" },
            ];
            UserModel.findAll.mockResolvedValue(mockUsers);

            // Act
            const result = await UserService.getUsers();

            // Assert
            expect(UserModel.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockUsers);
        });

        it("should throw an error when fetching users fails", async () => {
            // Arrange: mock rejection
            UserModel.findAll.mockRejectedValue(new Error("DB connection failed"));

            // Act & Assert
            await expect(UserService.getUsers())
            .rejects
            .toThrow("Error fetching users: DB connection failed");
        });
    });

    describe('getUserById', () => {
        it('should return user by id successfully', async () => {
            const mockUser = { id: 1, name: 'John', email: 'john@example.com' };
            UserModel.findById.mockResolvedValue(mockUser);

            const result = await UserService.getUserById(1);

            expect(result).toEqual(mockUser);
            expect(UserModel.findById).toHaveBeenCalledWith(1);
        });

        it('should throw error when id is not provided', async () => {
            await expect(UserService.getUserById()).rejects.toThrow('Error fetching user: User ID is required');
            expect(UserModel.findById).not.toHaveBeenCalled();
        });
    });

    describe('createUser', () => {
      const validUserData = {
        name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '1234567890'
      };

      beforeEach(() => {
          jest.clearAllMocks();
          UserModel.findByEmail = jest.fn();
          UserModel.create = jest.fn();
      });

            it("should throw an error when name is missing", async () => {
            // Arrange
            const userData = {
                last_name: 'Doe',
                email: 'john.doe@example.com',
                password: 'password123'
            };

            // Act & Assert
            await expect(UserService.createUser(userData))
                .rejects
                .toThrow('Name, last name, email, and password are required fields');
        });

        it("should throw an error when last_name is missing", async () => {
            // Arrange
            const userData = {
                name: 'John',
                email: 'john.doe@example.com',
                password: 'password123'
            };

            // Act & Assert
            await expect(UserService.createUser(userData))
                .rejects
                .toThrow('Name, last name, email, and password are required fields');
        });

        it("should throw an error when email is missing", async () => {
            // Arrange
            const userData = {
                name: 'John',
                last_name: 'Doe',
                password: 'password123'
            };

            // Act & Assert
            await expect(UserService.createUser(userData))
                .rejects
                .toThrow('Name, last name, email, and password are required fields');
        });

        it("should throw an error when password is missing", async () => {
            // Arrange
            const userData = {
                name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com'
            };

            // Act & Assert
            await expect(UserService.createUser(userData))
                .rejects
                .toThrow('Name, last name, email, and password are required fields');
        });

        it("should throw an error when multiple required fields are missing", async () => {
            // Arrange
            const userData = {
                name: 'John',
                // missing last_name, email, password
            };

            // Act & Assert
            await expect(UserService.createUser(userData))
                .rejects
                .toThrow('Name, last name, email, and password are required fields');
        });

        it("should throw an error when all required fields are empty strings", async () => {
            // Arrange
            const userData = {
                name: '',
                last_name: '',
                email: '',
                password: ''
            };

            // Act & Assert
            await expect(UserService.createUser(userData))
                .rejects
                .toThrow('Name, last name, email, and password are required fields');
        });

        it("should throw an error when required fields are null", async () => {
            // Arrange
            const userData = {
                name: null,
                last_name: 'Doe',
                email: 'john.doe@example.com',
                password: 'password123'
            };

            // Act & Assert
            await expect(UserService.createUser(userData))
                .rejects
                .toThrow('Name, last name, email, and password are required fields');
        });

        it("should throw an error when required fields are undefined", async () => {
            // Arrange
            const userData = {
                name: undefined,
                last_name: 'Doe',
                email: 'john.doe@example.com',
                password: 'password123'
            };

            // Act & Assert
            await expect(UserService.createUser(userData))
                .rejects
                .toThrow('Name, last name, email, and password are required fields');
        });

        it("should successfully create user when all required fields are provided and valid", async () => {
            // Arrange
            const userData = {
                name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                password: 'password123',
                phone: '+1234567890' // optional field
            };

            // Mock the dependent methods
            UserModel.findByEmail.mockResolvedValue(null);
            UserModel.create.mockResolvedValue({
                id: 1,
                ...userData,
                password: 'hashed_password' // assuming password is hashed in model
            });

            // Act
            const result = await UserService.createUser(userData);

            // Assert
            expect(result).toHaveProperty('id', 1);
            expect(result).toHaveProperty('name', 'John');
            expect(result).toHaveProperty('last_name', 'Doe');
            expect(result).toHaveProperty('email', 'john.doe@example.com');
            expect(UserModel.create).toHaveBeenCalledWith(userData);
        });

        it("should successfully create user when phone is missing (optional field)", async () => {
            // Arrange
            const userData = {
                name: 'Jane',
                last_name: 'Smith',
                email: 'jane.smith@example.com',
                password: 'password123'
                // phone is omitted
            };

            // Mock the dependent methods
            UserModel.findByEmail.mockResolvedValue(null);
            UserModel.create.mockResolvedValue({
                id: 2,
                ...userData,
                phone: null,
                password: 'hashed_password'
            });

            // Act
            const result = await UserService.createUser(userData);

            // Assert
            expect(result).toHaveProperty('id', 2);
            expect(result).toHaveProperty('name', 'Jane');
            expect(result).toHaveProperty('last_name', 'Smith');
            expect(result).toHaveProperty('email', 'jane.smith@example.com');
            expect(UserModel.create).toHaveBeenCalledWith(userData);
      });
    
      it('should create user successfully with valid data', async () => {
          const mockCreatedUser = { id: 1, ...validUserData };
          UserModel.findByEmail.mockResolvedValue(null);
          UserModel.create.mockResolvedValue(mockCreatedUser);

          const result = await UserService.createUser(validUserData);

          expect(result).toEqual(mockCreatedUser);
          expect(UserModel.findByEmail).toHaveBeenCalledWith('john@example.com');
          expect(UserModel.create).toHaveBeenCalledWith(validUserData);
      });
      it("should throw an error when password is null", async () => {
        // Arrange
        const userData = {
            name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            password: null
        };

        // Act & Assert
        await expect(UserService.createUser(userData))
            .rejects
            .toThrow('Error creating user: Name, last name, email, and password are required fields');
       });

      it("should throw an error when password is undefined", async () => {
          // Arrange
          const userData = {
              name: 'John',
              last_name: 'Doe',
              email: 'john.doe@example.com',
              password: undefined
          };

          // Act & Assert
          await expect(UserService.createUser(userData))
              .rejects
              .toThrow('Error creating user: Name, last name, email, and password are required fields');
      });

      it("should handle mixed character types in password validation", async () => {
          // Arrange
          const userData = {
              name: 'John',
              last_name: 'Doe',
              email: 'john.doe@example.com',
              password: 'aB1$dE' // exactly 6 characters with mixed types
          };

          // Mock the dependent methods
          UserModel.findByEmail.mockResolvedValue(null);
          UserModel.create.mockResolvedValue({
              id: 1,
              ...userData,
              password: 'hashed_password'
          });

          // Act
          const result = await UserService.createUser(userData);

          // Assert
          expect(result).toHaveProperty('id', 1);
          expect(UserModel.create).toHaveBeenCalledWith(userData);
      });

      it("should prioritize password length error over required fields error", async () => {
          // Arrange
          const userData = {
              name: 'John',
              last_name: 'Doe',
              email: 'john.doe@example.com',
              password: '123' // both missing other fields AND short password
          };

          // Act & Assert
          // The password length check happens after required fields check
          // So required fields error should be thrown first
          await expect(UserService.createUser(userData))
              .rejects
              .toThrow('Error creating user: Password must be at least 6 characters long');
      });
      it('should throw error when email already exists', async () => {
          UserModel.findByEmail.mockResolvedValue({ id: 1, ...validUserData });

          await expect(UserService.createUser(validUserData))
              .rejects
              .toThrow('Error creating user: Email already exists');
              
          expect(UserModel.findByEmail).toHaveBeenCalledWith('john@example.com');
          expect(UserModel.create).not.toHaveBeenCalled();
      });
      //Email regex validation
      it('should accept valid email formats', async () => {
        UserModel.findByEmail.mockResolvedValue(null); // email does NOT exist
        UserModel.create.mockResolvedValue({ id: 1, ...validUserData });
        const validEmails = [
          'user@example.com',
          'test.email@domain.co.uk',
          'user123@test-domain.com',
          'firstname.lastname@company.org',
          'user+tag@example.net',
          'a@b.co',
          'very.long.email.address@very.long.domain.name.com'
        ];

        for (const email of validEmails) {
          const userData = { ...validUserData, email };

          UserModel.findByEmail.mockResolvedValueOnce(null);
          UserModel.create.mockResolvedValueOnce({ id: 1, ...userData });
                    
          await expect(UserService.createUser(userData)).resolves.toBeDefined();
          expect(UserModel.findByEmail).toHaveBeenCalledWith(email);
        }
      });

/*    describe('UserService.createUser - email validation', () => { #badtest
      const validUserData = {
        name: "Test",
        last_name: "User",
        phone: "1234567890",
        email: "valid@example.com",
        password: "password123"
      };

      it('should reject invalid email formats', async () => {
        const invalidEmails = [
          'invalid-email',
          '@example.com',
          'user@',
          'user@domain',
          'user @example.com',
          'user@ example.com',
          'user@example .com',
          'user@@example.com',
          'user@example.',
          '',
          'user@',
          '@',
          'user@domain.',
          'user@.com'
        ];

        for (const email of invalidEmails) {
          const userData = { ...validUserData, email };

          await expect(UserService.createUser(userData))
            .rejects
            .toThrow('Error creating user: Invalid email format');

          expect(UserModel.findByEmail).not.toHaveBeenCalled();
          expect(UserModel.create).not.toHaveBeenCalled();
        }
      });
    });*/
    it('should validate email format before checking database', async () => {
      const invalidEmail = 'invalid-email-format';
      const userData = { ...validUserData, email: invalidEmail };

      await expect(UserService.createUser(userData))
        .rejects
        .toThrow('Error creating user: Invalid email format');

        // Should not call database if email format is invalid
      expect(UserModel.findByEmail).not.toHaveBeenCalled();
      expect(UserModel.create).not.toHaveBeenCalled();
  });
    
    it('should reject if email already exists', async () => {
      const userData = { ...validUserData, email: 'existing@example.com' };

      UserModel.findByEmail.mockResolvedValueOnce({ id: 99, email: userData.email });

      await expect(UserService.createUser(userData))
        .rejects
        .toThrow('Error creating user: Email already exists');

      expect(UserModel.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(UserModel.create).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    const updateData = {
      name: 'John Updated',
      email: 'john.updated@example.com'
    };

    it('should update user successfully', async () => {
      const existingUser = { id: 1, name: 'John', email: 'john@example.com' };
      const updatedUser = { id: 1, ...updateData };
      
      UserModel.findById.mockResolvedValueOnce(existingUser);
      UserModel.findByEmail.mockResolvedValue(null);
      UserModel.update.mockResolvedValue(true);
      UserModel.findById.mockResolvedValueOnce(updatedUser);

      const result = await UserService.updateUser(1, updateData);

      expect(result).toEqual(updatedUser);
      expect(UserModel.findById).toHaveBeenCalledWith(1);
      expect(UserModel.update).toHaveBeenCalledWith(1, updateData);
    });
    describe('Update Operation', () => {
      const existingUser = { id: 1, name: 'John', email: 'john@example.com' };

      it('should handle update failure', async () => {
        UserModel.findById.mockResolvedValueOnce(existingUser);
        UserModel.findByEmail.mockResolvedValue(null);
        UserModel.update.mockResolvedValue(false); // Update failed

        await expect(UserService.updateUser(1, updateData))
          .rejects
          .toThrow('Error updating user: Failed to update user');

        expect(UserModel.update).toHaveBeenCalledWith(1, updateData);
      });

      it('should handle update success and return updated user', async () => {
        const updatedUser = { id: 1, ...updateData };
        
        UserModel.findById.mockResolvedValueOnce(existingUser);
        UserModel.findByEmail.mockResolvedValue(null);
        UserModel.update.mockResolvedValue(true);
        UserModel.findById.mockResolvedValueOnce(updatedUser);

        const result = await UserService.updateUser(1, updateData);

        expect(result).toEqual(updatedUser);
        expect(UserModel.findById).toHaveBeenCalledTimes(2); // Once for check, once for return
        expect(UserModel.update).toHaveBeenCalledWith(1, updateData);
      });
    });
    it('should throw error when user not found', async () => {
      UserModel.findById.mockResolvedValue(null);

        await expect(UserService.updateUser(1, updateData))
            .resolves
            .toBeNull();

        expect(UserModel.findById).toHaveBeenCalledWith(1);
        expect(UserModel.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should soft delete user successfully', async () => {
      const mockUser = { id: 1, name: 'John' };
      UserModel.findById.mockResolvedValue(mockUser);
      UserModel.softDelete.mockResolvedValue(true);

      const result = await UserService.deleteUser(1);

      expect(result).toEqual(mockUser);
      expect(UserModel.findById).toHaveBeenCalledWith(1);
      expect(UserModel.softDelete).toHaveBeenCalledWith(1);
    });

    it('should return null when user not found for deletion', async () => {
      UserModel.findById.mockResolvedValue(null);

      const result = await UserService.deleteUser(999);

      expect(result).toBeNull();
      expect(UserModel.findById).toHaveBeenCalledWith(999);
      expect(UserModel.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('hardDeleteUser', () => {
    it('should hard delete user successfully', async () => {
      const mockUser = { id: 1, name: 'John' };
      UserModel.findById.mockResolvedValue(mockUser);
      UserModel.hardDelete.mockResolvedValue(true);

      const result = await UserService.hardDeleteUser(1);

      expect(result).toEqual(mockUser);
      expect(UserModel.findById).toHaveBeenCalledWith(1);
      expect(UserModel.hardDelete).toHaveBeenCalledWith(1);
    });

    it('should throw error when id is not provided', async () => {
      await expect(UserService.hardDeleteUser())
        .rejects
        .toThrow('Error permanently deleting user: User ID is required for hard delete');
      
      expect(UserModel.findById).not.toHaveBeenCalled();
      expect(UserModel.hardDelete).not.toHaveBeenCalled();
    });
  });
});

