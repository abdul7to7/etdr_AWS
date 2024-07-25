const Sequelize = require("sequelize");
const sequelize = require("../util/db");

const Expense = sequelize.define("expense", {
  amount: {
    type: Sequelize.DOUBLE,
    nullAllowed: false,
  },
  description: {
    type: Sequelize.STRING,
    nullAllowed: false,
  },
  category: {
    type: Sequelize.STRING,
    nullAllowed: false,
  },
});

module.exports = Expense;
