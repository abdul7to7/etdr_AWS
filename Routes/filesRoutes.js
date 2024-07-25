const { downloadReport } = require("../controllers/filesController");

const router = require("express").Router();

router.get("/download/report", downloadReport);

module.exports = router;
