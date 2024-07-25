const {
  buyMemberShip,
  verifyPurchase,
} = require("../controllers/purchaseController");

const router = require("express").Router();

router.get("/buymembership", buyMemberShip);
router.post("/verifyPayment", verifyPurchase);

module.exports = router;
