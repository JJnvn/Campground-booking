const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/productController");
const authMiddleware = require("../middleware/auth");

router.use(authMiddleware);

// router.get("/", bookingController.getAllBookings);
// router.get("/:id", bookingController.getBookingsById);
// router.post("/create", bookingController.createBooking);
// router.put("/update/:id", bookingController.updateBooking);
// router.delete("/delete/:id", bookingController.deleteBooking);

module.exports = router;
