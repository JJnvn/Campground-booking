const dotenv = require("dotenv");
const app = require("./app");
const connectDB = require("./config/db");
// const PORT = process.env.PORT || 5000;
// const logger = require("./utils/logger");

dotenv.config({ path: "./src/config/config.env" });
connectDB();

// app.listen(PORT, () => {
//   logger.info("Server is starting...");
// });
const https = require("https");
const fs = require("fs");
const logger = require("./utils/logger");

dotenv.config({ path: "./src/config/config.env" });
connectDB();

const httpsOpts = {
  key: fs.readFileSync("./src/certs/server.key"),
  cert: fs.readFileSync("./src/certs/server.crt"),
  ca: fs.readFileSync("./src/certs/rootCA.pem"),
  // ---- client-cert auth:
  requestCert: false,
  rejectUnauthorized: false, // bounce unknown certificates
};

const PORT = process.env.PORT || 5003;
https
  .createServer(httpsOpts, app)
  .listen(PORT, () => logger.info(`HTTPS server on https://localhost:${PORT}`));
