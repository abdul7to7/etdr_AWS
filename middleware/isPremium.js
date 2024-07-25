function isPremium(req, res, next) {
  if (!req.user.isPremium) {
    return res
      .status(403)
      .json({ success: false, message: "you are not a premium user" });
  }
  next();
}

module.exports = isPremium;
