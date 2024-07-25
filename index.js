const express = require("express");
require("dotenv").config();
const sequelize = require("./util/db");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

 const app = express();
//require("dotenv").config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
//app.use(helmet());
app.use(compression());
app.use(express.static(path.join(__dirname, 'frontend')));

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
app.use(morgan("combined", { stream: accessLogStream }));



const userRoutes = require("./Routes/userRoutes");
const expenseRoutes = require("./Routes/expenseRoutes");
const purchaseRoutes = require("./Routes/purchaseRoutes");
const filesRoutes = require("./Routes/filesRoutes");
const expenseFeaturesRoutes = require("./Routes/expenseFeaturesRoutes");

const User = require("./models/User");
const Expense = require("./models/Expense");
const authenticate = require("./middleware/authenticate");
const Order = require("./models/Order");
const ForgotPassword = require("./models/ForgotPassword");
const isPremium = require("./middleware/isPremium");

app.use("/user", userRoutes);
app.use("/expense", authenticate, expenseRoutes);
app.use("/purchase", authenticate, purchaseRoutes);
app.use("/expense_features", authenticate, isPremium, expenseFeaturesRoutes);
app.use("/files", authenticate, isPremium, filesRoutes);

app.get("*", (req, res) => {	
  res.sendFile(path.join(__dirname,'frontend',req.url));
});

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(ForgotPassword);
ForgotPassword.belongsTo(User);

sequelize
  // .sync({ force: true })
  // .sync({ alter: true })
  .sync()
  .then(() => {
    app.listen(process.env.PORT || 3000);
  })
  .then(() => {
    console.log("server is running");
  });
