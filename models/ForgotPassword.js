const Sequelize = require("sequelize");
const sequelize = require("../util/db");

const ForgotPassword = sequelize.define("forgotpassword", {
  id: {
    type: Sequelize.STRING,
    nullAllowed: false,
    primaryKey: true,
  },
  isActive: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = ForgotPassword;
