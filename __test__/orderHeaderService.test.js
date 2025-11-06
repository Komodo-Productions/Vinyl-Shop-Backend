const OrderHeaderService = require('../services/orderHeaderService');
const OrderHeaderModel = require('../models/orderHeaderModel');

jest.mock('../models/orderHeaderModel');

describe("orderHeaderService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------
  // getAllOrders
  // ----------------------
  describe("getAllOrders", () => {
    it("should return a list of orders", async () => {
      const mockOrders = [{ id: 1 }, { id: 2 }];
      OrderHeaderModel.findAll.mockResolvedValue(mockOrders);

      const result = await OrderHeaderService.getAllOrders();
      expect(result).toEqual(mockOrders);
      expect(OrderHeaderModel.findAll).toHaveBeenCalledTimes(1);
    });

    it("should throw if DB fails", async () => {
      OrderHeaderModel.findAll.mockRejectedValue(new Error("DB error"));

      await expect(OrderHeaderService.getAllOrders())
        .rejects.toThrow("Error fetching orders: DB error");
    });
  });

  // ----------------------
  // getOrderById
  // ----------------------
  describe("getOrderById", () => {
    it("should throw if no ID is provided", async () => {
      await expect(OrderHeaderService.getOrderById(null))
        .rejects.toThrow("Order ID is required");
    });

    it("should return null if order does not exist", async () => {
      OrderHeaderModel.findById.mockResolvedValue(undefined);
      const result = await OrderHeaderService.getOrderById(99);
      expect(result).toBeNull();
    });

    it("should return the order if it exists", async () => {
      const mockOrder = { id: 1, customer_id: 5 };
      OrderHeaderModel.findById.mockResolvedValue(mockOrder);

      const result = await OrderHeaderService.getOrderById(1);
      expect(result).toEqual(mockOrder);
    });

    it("should throw if DB fails", async () => {
      OrderHeaderModel.findById.mockRejectedValue(new Error("DB fail"));
      await expect(OrderHeaderService.getOrderById(1))
        .rejects.toThrow("Error fetching order: DB fail");
    });
  });

  // ----------------------
  // getOrdersByCustomerId
  // ----------------------
  describe("getOrdersByCustomerId", () => {
    it("should throw if no customerId is provided", async () => {
      await expect(OrderHeaderService.getOrdersByCustomerId(null))
        .rejects.toThrow("Customer ID is required");
    });

    it("should return orders for customer", async () => {
      const mockOrders = [{ id: 1, customer_id: 5 }];
      OrderHeaderModel.findByCustomerId.mockResolvedValue(mockOrders);

      const result = await OrderHeaderService.getOrdersByCustomerId(5);
      expect(result).toEqual(mockOrders);
    });

    it("should throw if DB fails", async () => {
      OrderHeaderModel.findByCustomerId.mockRejectedValue(new Error("DB error"));
      await expect(OrderHeaderService.getOrdersByCustomerId(5))
        .rejects.toThrow("Error fetching orders by customer: DB error");
    });
  });

  // ----------------------
  // getOrdersByStatus
  // ----------------------
  describe("getOrdersByStatus", () => {
    it("should throw if no status is provided", async () => {
      await expect(OrderHeaderService.getOrdersByStatus(null))
        .rejects.toThrow("Status is required");
    });

    it("should throw if status is invalid", async () => {
      await expect(OrderHeaderService.getOrdersByStatus("invalid"))
        .rejects.toThrow("Invalid order status");
    });

    it("should return orders for valid status", async () => {
      const mockOrders = [{ id: 3, status: "pending" }];
      OrderHeaderModel.findByStatus.mockResolvedValue(mockOrders);

      const result = await OrderHeaderService.getOrdersByStatus("pending");
      expect(result).toEqual(mockOrders);
    });

    it("should throw if DB fails", async () => {
      OrderHeaderModel.findByStatus.mockRejectedValue(new Error("DB fail"));
      await expect(OrderHeaderService.getOrdersByStatus("pending"))
        .rejects.toThrow("Error fetching orders by status: DB fail");
    });
  });

  // ----------------------
  // getOrdersByDateRange
  // ----------------------
  describe("getOrdersByDateRange", () => {
    it("should throw if startDate or endDate are missing", async () => {
      await expect(OrderHeaderService.getOrdersByDateRange(null, "2025-01-01"))
        .rejects.toThrow("Start date and end date are required");
    });

    it("should return orders in range", async () => {
      const mockOrders = [{ id: 1, order_date: "2025-01-01" }];
      OrderHeaderModel.findByDateRange.mockResolvedValue(mockOrders);

      const result = await OrderHeaderService.getOrdersByDateRange("2025-01-01", "2025-02-01");
      expect(result).toEqual(mockOrders);
    });

    it("should throw if DB fails", async () => {
      OrderHeaderModel.findByDateRange.mockRejectedValue(new Error("DB fail"));
      await expect(OrderHeaderService.getOrdersByDateRange("2025-01-01", "2025-02-01"))
        .rejects.toThrow("Error fetching orders by date range: DB fail");
    });
  });

  // ----------------------
  // createOrder
  // ----------------------
  describe("createOrder", () => {
    it("should throw if required fields are missing", async () => {
      await expect(OrderHeaderService.createOrder({}))
        .rejects.toThrow("Customer ID and total are required fields");
    });

    it("should throw if customerId is not a number", async () => {
      await expect(OrderHeaderService.createOrder({ customer_id: "abc", total: 100 }))
        .rejects.toThrow("Customer ID must be a valid number");
    });

    it("should throw if total <= 0", async () => {
      await expect(OrderHeaderService.createOrder({ customer_id: 1, total: 0 }))
        .rejects.toThrow("Total must be greater than 0");
    });

    it("should throw if status is invalid", async () => {
      await expect(OrderHeaderService.createOrder({ customer_id: 1, total: 50, status: "wrong" }))
        .rejects.toThrow("Invalid order status");
    });

    it("should create an order with defaults", async () => {
      const mockCreated = { id: 1, customer_id: 1, total: 50, status: "pending" };
      OrderHeaderModel.create.mockResolvedValue(mockCreated);

      const result = await OrderHeaderService.createOrder({ customer_id: 1, total: 50 });
      expect(result).toEqual(mockCreated);
      expect(OrderHeaderModel.create).toHaveBeenCalledWith(expect.objectContaining({
        customer_id: 1,
        total: 50,
        status: "pending"
      }));
    });

    it("should throw if DB fails", async () => {
      OrderHeaderModel.create.mockRejectedValue(new Error("Insert fail"));
      await expect(OrderHeaderService.createOrder({ customer_id: 1, total: 100 }))
        .rejects.toThrow("Error creating order: Insert fail");
    });
  });

  // ----------------------
  // updateOrder
  // ----------------------
  describe("updateOrder", () => {
    it("should throw if no ID is provided", async () => {
      await expect(OrderHeaderService.updateOrder(null, {}))
        .rejects.toThrow("Order ID is required for update");
    });

    it("should return null if order does not exist", async () => {
      OrderHeaderModel.findById.mockResolvedValue(null);
      const result = await OrderHeaderService.updateOrder(1, { total: 200 });
      expect(result).toBeNull();
    });

    it("should throw if total <= 0", async () => {
      OrderHeaderModel.findById.mockResolvedValue({ id: 1, total: 100 });
      await expect(OrderHeaderService.updateOrder(1, { total: 0 }))
        .rejects.toThrow("Total must be greater than 0");
    });

    it("should throw if customerId is not valid", async () => {
      OrderHeaderModel.findById.mockResolvedValue({ id: 1, total: 100 });
      await expect(OrderHeaderService.updateOrder(1, { customer_id: "abc" }))
        .rejects.toThrow("Customer ID must be a valid number");
    });

    it("should throw if status is invalid", async () => {
      OrderHeaderModel.findById.mockResolvedValue({ id: 1 });
      await expect(OrderHeaderService.updateOrder(1, { status: "invalid" }))
        .rejects.toThrow("Invalid order status");
    });

    it("should update and return the order", async () => {
      OrderHeaderModel.findById
        .mockResolvedValueOnce({ id: 1, total: 100 }) // existing
        .mockResolvedValueOnce({ id: 1, total: 200 }); // after update
      OrderHeaderModel.update.mockResolvedValue(true);

      const result = await OrderHeaderService.updateOrder(1, { total: 200 });
      expect(result).toEqual({ id: 1, total: 200 });
    });

    it("should throw if update fails", async () => {
      OrderHeaderModel.findById.mockResolvedValue({ id: 1, total: 100 });
      OrderHeaderModel.update.mockResolvedValue(false);

      await expect(OrderHeaderService.updateOrder(1, { total: 200 }))
        .rejects.toThrow("Error updating order: Failed to update order");
    });
  });

  // ----------------------
  // deleteOrder
  // ----------------------
  describe("deleteOrder", () => {
    it("should throw if no ID is provided", async () => {
      await expect(OrderHeaderService.deleteOrder(null))
        .rejects.toThrow("Order ID is required for delete");
    });

    it("should return null if order does not exist", async () => {
      OrderHeaderModel.findById.mockResolvedValue(null);
      const result = await OrderHeaderService.deleteOrder(5);
      expect(result).toBeNull();
    });

    it("should delete and return the order", async () => {
      const mockOrder = { id: 2, total: 50 };
      OrderHeaderModel.findById.mockResolvedValue(mockOrder);
      OrderHeaderModel.softDelete.mockResolvedValue(true);

      const result = await OrderHeaderService.deleteOrder(2);
      expect(result).toEqual(mockOrder);
    });

    it("should throw if delete fails", async () => {
      const mockOrder = { id: 3, total: 75 };
      OrderHeaderModel.findById.mockResolvedValue(mockOrder);
      OrderHeaderModel.softDelete.mockResolvedValue(false);

      await expect(OrderHeaderService.deleteOrder(3))
        .rejects.toThrow("Error deleting order: Failed to delete order");
    });
  });

  // ----------------------
  // getOrderStats
  // ----------------------
  describe("getOrderStats", () => {
    it("should return totals by status", async () => {
      const mockStats = [{ status: "pending", total: 5 }];
      OrderHeaderModel.getTotalsByStatus.mockResolvedValue(mockStats);

      const result = await OrderHeaderService.getOrderStats();
      expect(result).toEqual(mockStats);
    });

    it("should throw if DB fails", async () => {
      OrderHeaderModel.getTotalsByStatus.mockRejectedValue(new Error("DB fail"));
      await expect(OrderHeaderService.getOrderStats())
        .rejects.toThrow("Error getting order statistics: DB fail");
    });
  });

  // ----------------------
  // getCustomerTotals
  // ----------------------
  describe("getCustomerTotals", () => {
    it("should throw if no customerId is provided", async () => {
      await expect(OrderHeaderService.getCustomerTotals(null))
        .rejects.toThrow("Customer ID is required");
    });

    it("should throw if customerId is not valid", async () => {
      await expect(OrderHeaderService.getCustomerTotals("abc"))
        .rejects.toThrow("Customer ID must be a valid number");
    });

    it("should return totals for customer", async () => {
      const mockTotals = { customer_id: 1, total: 200 };
      OrderHeaderModel.getTotalsByCustomer.mockResolvedValue(mockTotals);

      const result = await OrderHeaderService.getCustomerTotals(1);
      expect(result).toEqual(mockTotals);
    });

    it("should throw if DB fails", async () => {
      OrderHeaderModel.getTotalsByCustomer.mockRejectedValue(new Error("DB fail"));
      await expect(OrderHeaderService.getCustomerTotals(1))
        .rejects.toThrow("Error getting customer totals: DB fail");
    });
  });

  // ----------------------
  // getMonthlyStats
  // ----------------------
  describe("getMonthlyStats", () => {
    it("should throw if no year is provided", async () => {
      await expect(OrderHeaderService.getMonthlyStats(null))
        .rejects.toThrow("Year is required");
    });

    it("should throw if year is invalid", async () => {
      await expect(OrderHeaderService.getMonthlyStats(1999))
        .rejects.toThrow("Invalid year provided");
    });

    it("should return stats for valid year", async () => {
      const mockStats = [{ month: 1, total: 100 }];
      OrderHeaderModel.getMonthlyStats.mockResolvedValue(mockStats);

      const result = await OrderHeaderService.getMonthlyStats(2025);
      expect(result).toEqual(mockStats);
    });

    it("should throw if DB fails", async () => {
      OrderHeaderModel.getMonthlyStats.mockRejectedValue(new Error("DB fail"));
      await expect(OrderHeaderService.getMonthlyStats(2025))
        .rejects.toThrow("Error getting monthly statistics: DB fail");
    });
  });
});
