const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middleware/auth");
const userController = require("../controllers/userController");
const isAdmin = require("../middleware/isAdmin");

router.post("/register", userController.registerAdmin);
router.post("/login", userController.loginUser);

router.use(authMiddleware, isAdmin);

router.get("/bookings", bookingController.getAllBookingsAdmin);
router.get("/bookings/:id", bookingController.getBookingsByIdAdmin);
router.put("/bookings/update/:id", bookingController.updateBookingAdmin);
router.delete("/bookings/delete/:id", bookingController.deleteBookingAdmin);

// Add other admin-only routes if needed (like user management, product management, etc.)

module.exports = router;
