const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoute");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authMiddeware = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

const apiRouter = express.Router();

app.use("/api", apiRouter);

apiRouter.use("/users", userRoutes);
// apiRouter.use("/products", productRoutes);
apiRouter.use("/bookings", bookingRoutes);
// apiRouter.use("/admin", adminRoutes);

module.exports = app;
