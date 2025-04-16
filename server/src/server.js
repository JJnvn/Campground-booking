const dotenv = require("dotenv");
const app = require("./app");
const connectDB = require("./config/db");
const PORT = process.env.PORT || 5000;
// const { Server } = require("http");

// const path = require("path");
// dotenv.config({
//     path: path.join(__dirname, "config", "config.env"),
// });

dotenv.config({ path: "./src/config/config.env" });
connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
