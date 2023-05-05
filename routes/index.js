import landRoutes from "./land.js";
import userRoutes from "./user.js";
import transactionRoutes from "./transaction.js";
import adminRoutes from './admin.js';
import {loginRoutes, signUpRoutes} from "./authentication.js";
const constructorMethod = (app) => {
  app.use("/land", landRoutes);
  app.use("/user", userRoutes);
  app.use("/admin", adminRoutes);
  app.use("/transactions", transactionRoutes);
  app.use("/login", loginRoutes);
  app.use("/signup", signUpRoutes);
  app.use("*", (req, res) => {
    res.status(400).json({ error: "Not Found" });
  });
};

export default constructorMethod;
