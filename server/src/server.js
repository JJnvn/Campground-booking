const dotenv = require("dotenv");
const app = require("./app");
const connectDB = require("./config/db");
const PORT = process.env.PORT || 5000;
const logger = require("./utils/logger");

dotenv.config({ path: "./src/config/config.env" });
connectDB();

app.listen(PORT, () => {
    logger.info("Server is starting...");
});
