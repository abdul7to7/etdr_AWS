const {
  userSignUp,
  login,
  forgotPassword,
  getResetPassword,
  postResetPassword,
} = require("../controllers/userController");

const router = require("express").Router();

router.post("/signup", userSignUp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/resetpassword", postResetPassword);
router.get("/resetpassword/:uuid", getResetPassword);

module.exports = router;
