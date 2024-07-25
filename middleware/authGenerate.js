const jwt = require("jsonwebtoken");
function generateToken(user) {
  const token = jwt.sign(user, "secret_key");
  return token;
}
module.exports = generateToken;
