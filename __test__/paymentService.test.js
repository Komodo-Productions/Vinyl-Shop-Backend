const PaymentService = require('../services/paymentService');
const PaymentModel = require('../models/paymentModel');

jest.mock('../models/paymentModel');

describe('PaymentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPayments', () => {
    it('should return all payments', async () => {
      const mockPayments = [{ id: 1 }, { id: 2 }];
      PaymentModel.findAll.mockResolvedValue(mockPayments);

      const result = await PaymentService.getAllPayments();

      expect(result).toEqual(mockPayments);
      expect(PaymentModel.findAll).toHaveBeenCalledTimes(1);
    });

    it('should throw error if query fails', async () => {
      PaymentModel.findAll.mockRejectedValue(new Error('DB error'));

      await expect(PaymentService.getAllPayments())
        .rejects
        .toThrow('Error fetching payments: DB error');
    });
  });

  describe('getPaymentById', () => {
    it('should return a payment by ID', async () => {
      const mockPayment = { id: 1, amount: 100 };
      PaymentModel.findById.mockResolvedValue(mockPayment);

      const result = await PaymentService.getPaymentById(1);

      expect(result).toEqual(mockPayment);
      expect(PaymentModel.findById).toHaveBeenCalledWith(1);
    });

    it('should return null if payment not found', async () => {
      PaymentModel.findById.mockResolvedValue(null);

      const result = await PaymentService.getPaymentById(999);

      expect(result).toBeNull();
      expect(PaymentModel.findById).toHaveBeenCalledWith(999);
    });

    it('should throw error if ID is not provided', async () => {
      await expect(PaymentService.getPaymentById())
        .rejects
        .toThrow('Error fetching payment: Payment ID is required');
    });

    it('should throw error if query fails', async () => {
      PaymentModel.findById.mockRejectedValue(new Error('DB error'));

      await expect(PaymentService.getPaymentById(1))
        .rejects
        .toThrow('Error fetching payment: DB error');
    });
  });

  describe('getPaymentsByOrderId', () => {
    it('should return payments by order ID', async () => {
      const mockPayments = [{ id: 1, order_id: 5 }, { id: 2, order_id: 5 }];
      PaymentModel.findByOrderId.mockResolvedValue(mockPayments);

      const result = await PaymentService.getPaymentsByOrderId(5);

      expect(result).toEqual(mockPayments);
      expect(PaymentModel.findByOrderId).toHaveBeenCalledWith(5);
    });

    it('should throw error if order ID is not provided', async () => {
      await expect(PaymentService.getPaymentsByOrderId())
        .rejects
        .toThrow('Error fetching payments by order: Order ID is required');
    });

    it('should throw error if query fails', async () => {
      PaymentModel.findByOrderId.mockRejectedValue(new Error('DB error'));

      await expect(PaymentService.getPaymentsByOrderId(1))
        .rejects
        .toThrow('Error fetching payments by order: DB error');
    });
  });

  describe('getPaymentsByStatus', () => {
    it('should return payments by valid status', async () => {
      const mockPayments = [{ id: 1, status: 'completed' }];
      PaymentModel.findByStatus.mockResolvedValue(mockPayments);

      const result = await PaymentService.getPaymentsByStatus('completed');

      expect(result).toEqual(mockPayments);
      expect(PaymentModel.findByStatus).toHaveBeenCalledWith('completed');
    });

    it('should throw error if status is not provided', async () => {
      await expect(PaymentService.getPaymentsByStatus())
        .rejects
        .toThrow('Error fetching payments by status: Status is required');
    });

    it('should throw error if status is invalid', async () => {
      await expect(PaymentService.getPaymentsByStatus('invalid_status'))
        .rejects
        .toThrow('Error fetching payments by status: Invalid payment status');
    });

    it('should accept all valid statuses', async () => {
      const validStatuses = ['pending', 'completed', 'failed', 'refunded', 'cancelled'];
      
      for (const status of validStatuses) {
        jest.clearAllMocks();
        PaymentModel.findByStatus.mockResolvedValue([]);
        
        await PaymentService.getPaymentsByStatus(status);
        
        expect(PaymentModel.findByStatus).toHaveBeenCalledWith(status);
      }
    });

    it('should throw error if query fails', async () => {
      PaymentModel.findByStatus.mockRejectedValue(new Error('DB error'));

      await expect(PaymentService.getPaymentsByStatus('completed'))
        .rejects
        .toThrow('Error fetching payments by status: DB error');
    });
  });

  describe('getPaymentsByDateRange', () => {
    it('should return payments by date range', async () => {
      const mockPayments = [{ id: 1, payment_date: '2024-01-15' }];
      PaymentModel.findByDateRange.mockResolvedValue(mockPayments);

      const result = await PaymentService.getPaymentsByDateRange('2024-01-01', '2024-01-31');

      expect(result).toEqual(mockPayments);
      expect(PaymentModel.findByDateRange).toHaveBeenCalledWith('2024-01-01', '2024-01-31');
    });

    it('should throw error if start date is not provided', async () => {
      await expect(PaymentService.getPaymentsByDateRange(null, '2024-01-31'))
        .rejects
        .toThrow('Error fetching payments by date range: Start date and end date are required');
    });

    it('should throw error if end date is not provided', async () => {
      await expect(PaymentService.getPaymentsByDateRange('2024-01-01', null))
        .rejects
        .toThrow('Error fetching payments by date range: Start date and end date are required');
    });

    it('should throw error if query fails', async () => {
      PaymentModel.findByDateRange.mockRejectedValue(new Error('DB error'));

      await expect(PaymentService.getPaymentsByDateRange('2024-01-01', '2024-01-31'))
        .rejects
        .toThrow('Error fetching payments by date range: DB error');
    });
  });

  describe('createPayment', () => {
    const validPaymentData = {
      order_id: 1,
      method: 'cash',
      amount: 50
    };

    it('should create a new payment with required fields', async () => {
      const createdPayment = { id: 1, ...validPaymentData, status: 'pending' };
      PaymentModel.create.mockResolvedValue(createdPayment);

      const result = await PaymentService.createPayment(validPaymentData);

      expect(result).toEqual(createdPayment);
      expect(PaymentModel.create).toHaveBeenCalledWith(expect.objectContaining({
        order_id: 1,
        method: 'cash',
        amount: 50,
        status: 'pending'
      }));
    });

    it('should create payment with all optional fields', async () => {
      const completePaymentData = {
        ...validPaymentData,
        payment_date: '2024-01-15',
        status: 'completed'
      };
      PaymentModel.create.mockResolvedValue(completePaymentData);

      const result = await PaymentService.createPayment(completePaymentData);

      expect(result).toEqual(completePaymentData);
      expect(PaymentModel.create).toHaveBeenCalledWith(expect.objectContaining(completePaymentData));
    });

    it('should set default payment date if not provided', async () => {
      PaymentModel.create.mockResolvedValue({ id: 1, ...validPaymentData });

      await PaymentService.createPayment(validPaymentData);

      expect(PaymentModel.create).toHaveBeenCalledWith(expect.objectContaining({
        payment_date: expect.any(String)
      }));
    });

    it('should throw error if order_id is missing', async () => {
      await expect(PaymentService.createPayment({ method: 'cash', amount: 50 }))
        .rejects
        .toThrow('Error creating payment: Order ID, method, and amount are required fields');
    });

    it('should throw error if method is missing', async () => {
      await expect(PaymentService.createPayment({ order_id: 1, amount: 50 }))
        .rejects
        .toThrow('Error creating payment: Order ID, method, and amount are required fields');
    });

    it('should throw error if amount is missing', async () => {
      await expect(PaymentService.createPayment({ order_id: 1, method: 'cash' }))
        .rejects
        .toThrow('Error creating payment: Order ID, method, and amount are required fields');
    });

    it('should throw error if order_id is not a valid number', async () => {
      await expect(PaymentService.createPayment({ order_id: 'invalid', method: 'cash', amount: 50 }))
        .rejects
        .toThrow('Error creating payment: Order ID must be a valid number');
    });

    it('should throw error if amount is negative', async () => {
      await expect(PaymentService.createPayment({ order_id: 1, method: 'cash', amount: -50 }))
        .rejects
        .toThrow('Error creating payment: Amount must be greater than 0');
    });

    it('should throw error if payment method is invalid', async () => {
      await expect(PaymentService.createPayment({ order_id: 1, method: 'bitcoin', amount: 50 }))
        .rejects
        .toThrow('Error creating payment: Invalid payment method');
    });

    it('should accept all valid payment methods', async () => {
      const validMethods = ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash', 'check'];
      
      for (const method of validMethods) {
        jest.clearAllMocks();
        PaymentModel.create.mockResolvedValue({ id: 1, order_id: 1, method, amount: 50 });
        
        await PaymentService.createPayment({ order_id: 1, method, amount: 50 });
        
        expect(PaymentModel.create).toHaveBeenCalled();
      }
    });

    it('should throw error if status is invalid', async () => {
      await expect(PaymentService.createPayment({ 
        order_id: 1, 
        method: 'cash', 
        amount: 50, 
        status: 'invalid_status' 
      }))
        .rejects
        .toThrow('Error creating payment: Invalid payment status');
    });

    it('should accept all valid statuses', async () => {
      const validStatuses = ['pending', 'completed', 'failed', 'refunded', 'cancelled'];
      
      for (const status of validStatuses) {
        jest.clearAllMocks();
        PaymentModel.create.mockResolvedValue({ id: 1, order_id: 1, method: 'cash', amount: 50, status });
        
        await PaymentService.createPayment({ order_id: 1, method: 'cash', amount: 50, status });
        
        expect(PaymentModel.create).toHaveBeenCalled();
      }
    });

    it('should throw error if creation fails', async () => {
      PaymentModel.create.mockRejectedValue(new Error('DB error'));

      await expect(PaymentService.createPayment(validPaymentData))
        .rejects
        .toThrow('Error creating payment: DB error');
    });

    it('should convert string order_id to number', async () => {
      PaymentModel.create.mockResolvedValue({ id: 1 });

      await PaymentService.createPayment({ order_id: '5', method: 'cash', amount: 50 });

      expect(PaymentModel.create).toHaveBeenCalledWith(expect.objectContaining({
        order_id: 5
      }));
    });

    it('should convert string amount to number', async () => {
      PaymentModel.create.mockResolvedValue({ id: 1 });

      await PaymentService.createPayment({ order_id: 1, method: 'cash', amount: '50.50' });

      expect(PaymentModel.create).toHaveBeenCalledWith(expect.objectContaining({
        amount: 50.50
      }));
    });
  });

  describe('updatePayment', () => {
    const existingPayment = { id: 1, order_id: 1, method: 'cash', amount: 100 };

    it('should update an existing payment', async () => {
      const updatedPayment = { ...existingPayment, amount: 150 };
      PaymentModel.findById.mockResolvedValueOnce(existingPayment);
      PaymentModel.update.mockResolvedValue([1]);
      PaymentModel.findById.mockResolvedValueOnce(updatedPayment);

      const result = await PaymentService.updatePayment(1, { amount: 150 });

      expect(result).toEqual(updatedPayment);
      expect(PaymentModel.update).toHaveBeenCalledWith(1, { amount: 150 });
    });

    it('should return null if payment does not exist', async () => {
      PaymentModel.findById.mockResolvedValue(null);

      const result = await PaymentService.updatePayment(999, { amount: 150 });

      expect(result).toBeNull();
      expect(PaymentModel.update).not.toHaveBeenCalled();
    });

    it('should throw error if ID is not provided', async () => {
      await expect(PaymentService.updatePayment(null, { amount: 150 }))
        .rejects
        .toThrow('Error updating payment: Payment ID is required for update');
    });

    it('should update order_id', async () => {
      PaymentModel.findById.mockResolvedValueOnce(existingPayment);
      PaymentModel.update.mockResolvedValue([1]);
      PaymentModel.findById.mockResolvedValueOnce({ ...existingPayment, order_id: 2 });

      await PaymentService.updatePayment(1, { order_id: 2 });

      expect(PaymentModel.update).toHaveBeenCalledWith(1, { order_id: 2 });
    });

    it('should update method', async () => {
      PaymentModel.findById.mockResolvedValueOnce(existingPayment);
      PaymentModel.update.mockResolvedValue([1]);
      PaymentModel.findById.mockResolvedValueOnce({ ...existingPayment, method: 'credit_card' });

      await PaymentService.updatePayment(1, { method: 'credit_card' });

      expect(PaymentModel.update).toHaveBeenCalledWith(1, { method: 'credit_card' });
    });

    it('should update payment_date', async () => {
      PaymentModel.findById.mockResolvedValueOnce(existingPayment);
      PaymentModel.update.mockResolvedValue([1]);
      PaymentModel.findById.mockResolvedValueOnce({ ...existingPayment, payment_date: '2024-01-15' });

      await PaymentService.updatePayment(1, { payment_date: '2024-01-15' });

      expect(PaymentModel.update).toHaveBeenCalledWith(1, { payment_date: '2024-01-15' });
    });

    it('should update status', async () => {
      PaymentModel.findById.mockResolvedValueOnce(existingPayment);
      PaymentModel.update.mockResolvedValue([1]);
      PaymentModel.findById.mockResolvedValueOnce({ ...existingPayment, status: 'completed' });

      await PaymentService.updatePayment(1, { status: 'completed' });

      expect(PaymentModel.update).toHaveBeenCalledWith(1, { status: 'completed' });
    });

    it('should throw error if amount is zero', async () => {
      PaymentModel.findById.mockResolvedValue(existingPayment);

      await expect(PaymentService.updatePayment(1, { amount: 0 }))
        .rejects
        .toThrow('Error updating payment: Amount must be greater than 0');
    });

    it('should throw error if amount is negative', async () => {
      PaymentModel.findById.mockResolvedValue(existingPayment);

      await expect(PaymentService.updatePayment(1, { amount: -50 }))
        .rejects
        .toThrow('Error updating payment: Amount must be greater than 0');
    });

    it('should throw error if order_id is not a valid number', async () => {
      PaymentModel.findById.mockResolvedValue(existingPayment);

      await expect(PaymentService.updatePayment(1, { order_id: 'invalid' }))
        .rejects
        .toThrow('Error updating payment: Order ID must be a valid number');
    });

    it('should throw error if method is invalid', async () => {
      PaymentModel.findById.mockResolvedValue(existingPayment);

      await expect(PaymentService.updatePayment(1, { method: 'bitcoin' }))
        .rejects
        .toThrow('Error updating payment: Invalid payment method');
    });

    it('should throw error if status is invalid', async () => {
      PaymentModel.findById.mockResolvedValue(existingPayment);

      await expect(PaymentService.updatePayment(1, { status: 'invalid_status' }))
        .rejects
        .toThrow('Error updating payment: Invalid payment status');
    });

    it('should throw error if update operation fails', async () => {
      PaymentModel.findById.mockResolvedValue(existingPayment);
      PaymentModel.update.mockResolvedValue(false);

      await expect(PaymentService.updatePayment(1, { amount: 150 }))
        .rejects
        .toThrow('Error updating payment: Failed to update payment');
    });

    it('should throw error if database update fails', async () => {
      PaymentModel.findById.mockResolvedValue(existingPayment);
      PaymentModel.update.mockRejectedValue(new Error('DB error'));

      await expect(PaymentService.updatePayment(1, { amount: 150 }))
        .rejects
        .toThrow('Error updating payment: DB error');
    });

    it('should convert string order_id to number', async () => {
      PaymentModel.findById.mockResolvedValueOnce(existingPayment);
      PaymentModel.update.mockResolvedValue([1]);
      PaymentModel.findById.mockResolvedValueOnce(existingPayment);

      await PaymentService.updatePayment(1, { order_id: '5' });

      expect(PaymentModel.update).toHaveBeenCalledWith(1, { order_id: 5 });
    });

    it('should convert string amount to number', async () => {
      PaymentModel.findById.mockResolvedValueOnce(existingPayment);
      PaymentModel.update.mockResolvedValue([1]);
      PaymentModel.findById.mockResolvedValueOnce(existingPayment);

      await PaymentService.updatePayment(1, { amount: '75.50' });

      expect(PaymentModel.update).toHaveBeenCalledWith(1, { amount: 75.50 });
    });

    it('should update multiple fields at once', async () => {
      PaymentModel.findById.mockResolvedValueOnce(existingPayment);
      PaymentModel.update.mockResolvedValue([1]);
      PaymentModel.findById.mockResolvedValueOnce(existingPayment);

      await PaymentService.updatePayment(1, { 
        order_id: 2, 
        method: 'credit_card', 
        amount: 200,
        status: 'completed'
      });

      expect(PaymentModel.update).toHaveBeenCalledWith(1, {
        order_id: 2,
        method: 'credit_card',
        amount: 200,
        status: 'completed'
      });
    });
  });

  describe('deletePayment', () => {
    it('should soft delete a payment', async () => {
      const mockPayment = { id: 1, amount: 200 };
      PaymentModel.findById.mockResolvedValue(mockPayment);
      PaymentModel.softDelete.mockResolvedValue(true);

      const result = await PaymentService.deletePayment(1);

      expect(result).toEqual(mockPayment);
      expect(PaymentModel.softDelete).toHaveBeenCalledWith(1);
    });

    it('should return null if payment does not exist', async () => {
      PaymentModel.findById.mockResolvedValue(null);

      const result = await PaymentService.deletePayment(999);

      expect(result).toBeNull();
      expect(PaymentModel.softDelete).not.toHaveBeenCalled();
    });

    it('should throw error if ID is not provided', async () => {
      await expect(PaymentService.deletePayment())
        .rejects
        .toThrow('Error deleting payment: Payment ID is required for delete');
    });

    it('should throw error if soft delete operation fails', async () => {
      PaymentModel.findById.mockResolvedValue({ id: 1 });
      PaymentModel.softDelete.mockResolvedValue(false);

      await expect(PaymentService.deletePayment(1))
        .rejects
        .toThrow('Error deleting payment: Failed to delete payment');
    });

    it('should throw error if database soft delete fails', async () => {
      PaymentModel.findById.mockResolvedValue({ id: 1 });
      PaymentModel.softDelete.mockRejectedValue(new Error('DB error'));

      await expect(PaymentService.deletePayment(1))
        .rejects
        .toThrow('Error deleting payment: DB error');
    });
  });

  describe('getPaymentSummary', () => {
    it('should return payment summary', async () => {
      const mockSummary = { total: 1000, completed: 5 };
      PaymentModel.getPaymentSummary.mockResolvedValue(mockSummary);

      const result = await PaymentService.getPaymentSummary();

      expect(result).toEqual(mockSummary);
      expect(PaymentModel.getPaymentSummary).toHaveBeenCalledTimes(1);
    });

    it('should throw error if summary retrieval fails', async () => {
      PaymentModel.getPaymentSummary.mockRejectedValue(new Error('DB error'));

      await expect(PaymentService.getPaymentSummary())
        .rejects
        .toThrow('Error getting payment summary: DB error');
    });
  });

  describe('getTotalByStatus', () => {
    it('should return total by status', async () => {
      const mockTotal = { status: 'completed', total: 500 };
      PaymentModel.getTotalByStatus.mockResolvedValue(mockTotal);

      const result = await PaymentService.getTotalByStatus('completed');

      expect(result).toEqual(mockTotal);
      expect(PaymentModel.getTotalByStatus).toHaveBeenCalledWith('completed');
    });

    it('should throw error if status is not provided', async () => {
      await expect(PaymentService.getTotalByStatus())
        .rejects
        .toThrow('Error getting total by status: Status is required');
    });

    it('should throw error if status is invalid', async () => {
      await expect(PaymentService.getTotalByStatus('invalid_status'))
        .rejects
        .toThrow('Error getting total by status: Invalid payment status');
    });

    it('should accept all valid statuses', async () => {
      const validStatuses = ['pending', 'completed', 'failed', 'refunded', 'cancelled'];
      
      for (const status of validStatuses) {
        jest.clearAllMocks();
        PaymentModel.getTotalByStatus.mockResolvedValue({ status, total: 100 });
        
        await PaymentService.getTotalByStatus(status);
        
        expect(PaymentModel.getTotalByStatus).toHaveBeenCalledWith(status);
      }
    });

    it('should throw error if query fails', async () => {
      PaymentModel.getTotalByStatus.mockRejectedValue(new Error('DB error'));

      await expect(PaymentService.getTotalByStatus('completed'))
        .rejects
        .toThrow('Error getting total by status: DB error');
    });
  });
});