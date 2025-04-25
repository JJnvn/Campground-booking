const dotenv = require("dotenv");
const app = require("./app");
const connectDB = require("./config/db");

dotenv.config({ path: "./src/config/config.env" });
connectDB();

const https = require("https");
const fs = require("fs");
const logger = require("./utils/logger");

dotenv.config({ path: "./src/config/config.env" });
connectDB();

const httpsOpts = {
  key: fs.readFileSync("./src/certs/server.key"),
  cert: fs.readFileSync("./src/certs/server.crt"),
  ca: fs.readFileSync("./src/certs/rootCA.pem"),
  requestCert: true,
  rejectUnauthorized: true,
};

const PORT = process.env.PORT || 5003;
https
  .createServer(httpsOpts, app)
  .listen(PORT, () => logger.info(`HTTPS server on https://localhost:${PORT}`));
