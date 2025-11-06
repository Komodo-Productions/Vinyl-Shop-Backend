
// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

router.post("/", paymentController.create);
router.get("/", paymentController.getAll);
router.get("/:id", paymentController.getById);
router.put("/:id", paymentController.update);
router.delete("/:id", paymentController.delete);

module.exports = router;
