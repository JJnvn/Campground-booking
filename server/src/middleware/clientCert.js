module.exports = (req, res, next) => {
  if (req.client?.authorized) return next();
  return res.status(401).json({ message: "Client certificate required" });
};
