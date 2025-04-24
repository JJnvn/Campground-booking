const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/auth");
const clientCert = require("../middleware/clientCert");

router.use(authMiddleware);
// router.use(clientCert); // new PKI auth (only for /api/products)

router.get("/", clientCert, productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.post("/create", productController.createProduct);
router.put("/update/:id", productController.updateProduct);
router.delete("/delete/:id", productController.deleteProduct);

module.exports = router;
