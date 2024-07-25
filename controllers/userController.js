const generateToken = require("../middleware/authGenerate");
const User = require("../models/User");
const bcrypt = require("bcrypt");

const SibApiV3Sdk = require("sib-api-v3-sdk");
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.SDK_API_KEY;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const { v4: uuidv4 } = require("uuid");
const ForgotPassword = require("../models/ForgotPassword");
const { where } = require("sequelize");

exports.userSignUp = async (req, res, next) => {
  try {
    const hashed = await bcrypt.hash(req.body.password, 10);
    if (!hashed) {
      return res.status(500).json(err);
    }
    const user = await User.create({
      username: req.body.username,
      mail: req.body.mail,
      password: hashed,
    });
    if (user) {
      const token = generateToken({
        id: user.id,
        username: user.username,
        isPremium: user.isPremium,
      });
      return (
        res
          // .redirect("/expenseForm.html");
          .status(201)
          .json({
            success: true,
            message: "user succesfully created",
            token: token,
          })
      );
    } else {
      return res
        .status(500)
        .json({ success: false, message: "register failed" });
    }
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "something went wrong" });
  }
};

exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { mail: req.body.mail } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }

    const result = await bcrypt.compare(req.body.password, user.password);

    if (!result) {
      return res
        .status(401)
        .json({ success: false, message: "password not matched" });
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      isPremium: user.isPremium,
    });
    return (
      res
        // .status(302)
        // .redirect("/expenseForm.html");
        .status(201)
        .json({ success: true, token: token })
    );
  } catch (e) {
    res.status(500).json({ success: false, message: "something went wrong" });
  }
};

exports.forgotPassword = async (req, res, next) => {
  
  const uuid = uuidv4();
  const sendSmtpEmail = {
    to: [
      {
        // email: "abdul7to7@gmail.com",
        email: req.body.mail,
        // name: 'User Name' // Optionally, you can add a name
      },
    ],
    sender: {
      email: "abdul7to7@gmail.com",
      name: "Expense_Demo",
    },
    subject: "Password Reset Request",
    htmlContent: `
      <html>
      <body>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="http://localhost:4000/user/resetpassword/${uuid}">Reset Password</a>
      </body>
      </html>`,
  };
  try {
    const user = await User.findOne({ where: { mail: req.body.mail } });
    if (user) await ForgotPassword.create({ id: uuid, userId: user.id });
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

exports.getResetPassword = async (req, res, next) => {
  const uuid = req.params.uuid;
  const fp = await ForgotPassword.findOne({ where: { id: uuid } });
  if (fp && fp.isActive) {
    res.status(201).send(`
      <html>
      <head>
      <style>
      </style>
      </head>
      <body>
      <div class="mainContainer">
      <h2>Enter new password</h2>
      <div class="formContainer">
      <form action="http://localhost:4000/user/resetpassword" method="POST">
      <input type="hidden" name="uuid" value="${uuid}" />
      <input type="password" name="password" required />
      <button type="submit" class="btn">Reset Password</button>
    </form>
    </div>
    </div>
    </body>
    <script>
    </script>
    </html>
    `);
  } else {
    res.status(500).json({ message: "Invalid reset password link" });
  }
};

exports.postResetPassword = async (req, res, next) => {
  const fp = await ForgotPassword.findOne({ where: { id: req.body.uuid } });
  if (!fp.isActive)
    return res.json({ message: "link invalid", success: false });
  const hashed = await bcrypt.hash(req.body.password, 10);
  await fp.update({ isActive: false });
  await User.update({ password: hashed }, { where: { id: fp.userId } });
  res.send("password reset successfully");
};
