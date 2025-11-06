const express = require('express');
const OrderHeaderController = require('../controllers/orderHeaderController');

const router = express.Router();

// Obtener todas las órdenes
router.get('/', OrderHeaderController.getAll);

// Obtener orden por ID
router.get('/:id', OrderHeaderController.getById);

// Obtener órdenes por cliente
router.get('/customer/:customerId', OrderHeaderController.getByCustomerId);

// Obtener órdenes por estado
router.get('/status/:status', OrderHeaderController.getByStatus);

// Obtener órdenes por rango de fechas (usando query params ?startDate=...&endDate=...)
router.get('/date-range', OrderHeaderController.getByDateRange);

// Crear nueva orden
router.post('/', OrderHeaderController.create);

// Actualizar orden por ID
router.put('/:id', OrderHeaderController.update);

// Eliminar orden por ID
router.delete('/:id', OrderHeaderController.delete);

// Estadísticas generales
router.get('/stats/overview', OrderHeaderController.getStats);

// Totales de un cliente
router.get('/stats/customer/:customerId', OrderHeaderController.getCustomerTotals);

// Estadísticas mensuales por año
router.get('/stats/monthly/:year', OrderHeaderController.getMonthlyStats);

module.exports = router;
