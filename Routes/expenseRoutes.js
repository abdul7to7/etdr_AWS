const {
  addExpense,
  deleteExpense,
  getAllExpenses,
  getLeaderboard,
  getAllExpensesByPage,
} = require("../controllers/expenseController");

const router = require("express").Router();

router.post("/add_expense", addExpense);
router.get("/delete_expense/:expense_id", deleteExpense);
router.get("/get_expenses", getAllExpensesByPage);
router.get("/get_all_expenses", getAllExpenses);

module.exports = router;
