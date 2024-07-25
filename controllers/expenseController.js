const { Sequelize } = require("sequelize");
const Expense = require("../models/Expense");
const User = require("../models/User");
const sequelize = require("../util/db");

exports.getAllExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.findAll({ where: { userId: req.user.id } });
    return res.status(201).json({
      success: true,
      expenses: expenses,
      user: {
        username: req.user.username,
        isPremium: req.user.isPremium,
        totalExpense: req.user.totalExpense,
      },
    });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: `Something went wrong ${e}` });
  }
};

exports.getAllExpensesByPage = async (req, res, next) => {
  try {
    let page = Number(req.query.page);
    let size = Number(req.query.size);
    const { count, rows } = await Expense.findAndCountAll({
      limit: size,
      offset: (page - 1) * size,
      where: { userId: req.user.id },
    });
    return res.status(201).json({
      success: true,
      expenses: rows,
      user: {
        username: req.user.username,
        isPremium: req.user.isPremium,
        totalExpense: req.user.totalExpense,
      },
      lastPage: Math.ceil(count / size) - page > 0 ? false : true,
    });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: `Something went wrong ${e}` });
  }
};

exports.addExpense = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const expense = await Expense.create(
      {
        amount: req.body.amount,
        description: req.body.description,
        category: req.body.category,
        userId: req.user.id,
      },
      {
        transaction: t,
      }
    );
    await User.increment(
      { totalExpense: req.body.amount },
      { where: { id: req.user.id }, transaction: t }
    );
    await t.commit();
    return res.status(201).json({
      sucess: true,
      message: "expense created successfully",
      expense: expense,
    });
  } catch (e) {
    await t.rollback();
    return res
      .status(500)
      .json({ success: false, message: `Something went wrong :${e}` });
  }
};

exports.deleteExpense = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const expense = await Expense.findByPk(req.params.expense_id);
    await Expense.destroy({
      where: { id: req.params.expense_id, userId: req.user.id },
      transaction: t,
    });
    await User.increment(
      { totalExpense: -expense.amount },
      { where: { id: req.user.id }, transaction: t }
    );
    await t.commit();
    return res
      .status(201)
      .json({ success: true, message: "deleted successfully" });
  } catch (e) {
    t.rollback();
    return res
      .status(500)
      .json({ success: false, message: `Something went wrong ${e}` });
  }
};
exports.getLeaderboard = async (req, res, next) => {
  const usersWithExpenses = await User.findAll({
    attributes: ["username", "totalExpense"],
    order: [["totalExpense", "DESC"]],
  });
  res.send({ usersWithExpenses: usersWithExpenses });
};
