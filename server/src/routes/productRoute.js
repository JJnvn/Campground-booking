const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/auth");

router.use(authMiddleware);
// router.get("/", productController.getAllProducts);
// router.get("/:id", productController.getProductById);

module.exports = router;
