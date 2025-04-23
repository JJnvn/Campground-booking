const logger = require("../utils/logger");

const isAdmin = (req, res, next) => {
    if (req.user?.role === "admin") {
        return next();
    }
    logger.warn(
        `Access denied: User ${
            req.user?.id || "unknown"
        } attempted to access admin route`
    );
    return res.status(403).json({ message: "Forbidden: Admins only" });
};

module.exports = isAdmin;
