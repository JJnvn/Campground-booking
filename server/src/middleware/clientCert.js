module.exports = (req, res, next) => {
  // OpenSSL + Node finish the handshake; just check the result
  if (req.client?.authorized) return next();
  return res.status(401).json({ message: "Client certificate required" });
};
