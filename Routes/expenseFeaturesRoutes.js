const { getLeaderboard } = require("../controllers/expenseController");

const router = require("express").Router();

router.get("/leaderboard", getLeaderboard);

module.exports = router;
