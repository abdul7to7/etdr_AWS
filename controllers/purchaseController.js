const razorPay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const { where } = require("sequelize");
const User = require("../models/User");
const generateToken = require("../middleware/authGenerate");
exports.buyMemberShip = (req, res, next) => {
  try {
    let rzp = new razorPay({
      key_id: process.env.RZP_KEY_ID,
      key_secret: process.env.RZP_KEY_SECRET,
    });
    const amount = 2500;
    rzp.orders.create({ amount, currency: "INR" }, (err, rzpOrder) => {
      if (err) {
        res
          .status(500)
          .json({ success: false, message: `Something went wrong ${err}` });
      }
      Order.create({
        userId: req.user.id,
        rzpOrderId: rzpOrder.id,
        status: "PENDING",
      })
        .then((order) => {
          return res
            .status(201)
            .json({ orderId: order.id, rzpOrder, key_id: rzp.key_id });
        })
        .catch((err) => {
          throw new Error(JSON.stringify(err));
        });
    });
  } catch (err) {
    throw new Error(JSON.stringify(err));
  }
};

exports.verifyPurchase = async (req, res, next) => {
  const { orderId, rzpOrderId, payment_id, signature } = req.body;

  const hmac = crypto.createHmac("sha256", process.env.RZP_KEY_SECRET);
  hmac.update(rzpOrderId + "|" + payment_id);
  const generatedSignature = hmac.digest("hex");
  const status = generatedSignature === signature ? "SUCESSS" : "FAILED";
  const userStatus = generatedSignature === signature ? true : false;
  const userIsPremium = generatedSignature === signature ? true : false;
  await Promise.all([
    Order.update(
      {
        status: status,
        paymentId: payment_id,
      },
      { where: { id: orderId } }
    ),
    User.update({ isPremium: userStatus }, { where: { id: req.user.id } }),
  ]);
  if (generatedSignature === signature) {
    const token = generateToken({
      id: req.user.id,
      username: req.user.username,
      isPremium: userIsPremium,
    });
    res.json({
      status: "success",
      message: "Payment verified successfully",
      token: token,
      user: {
        username: req.user.username,
        isPremium: userIsPremium,
      },
    });
  } else {
    throw new Error(
      JSON.stringify({
        message: "Payment verification failed",
        rzpOrderId,
        payment_id,
      })
    );
  }
};
