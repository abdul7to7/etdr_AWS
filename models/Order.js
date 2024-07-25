const Sequelize = require("sequelize");
const sequelize = require("../util/db");

const Order = sequelize.define("order", {
  status: {
    type: Sequelize.STRING,
    nullAllowed: false,
    default: "Pending",
  },
  rzpOrderId: Sequelize.STRING,
  paymentId: Sequelize.STRING,
});
module.exports = Order;
