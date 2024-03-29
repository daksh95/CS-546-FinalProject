import landRoutes from "./land.js";
import userRoutes from "./user.js";
import transactionRoutes from "./transaction.js";
import adminRoutes from "./admin.js";
import entityRoutes from "./entity.js";
import { loginRoutes, signUpRoutes, logoutRoutes } from "./authentication.js";

const constructorMethod = (app) => {
  app.use("/land", landRoutes);
  app.use("/user", userRoutes);
  app.use("/admin", adminRoutes);
  app.use("/entity", entityRoutes);
  app.use("/transactions", transactionRoutes);
  app.use("/login", loginRoutes);
  app.use("/signup", signUpRoutes);
  app.use("/logout", logoutRoutes);
  app.use("*", (req, res) => {
    res.status(400).render("error", {
      title: "Error",
      hasError: true,
      error: ["Page Not Found"],
    });
  });
};

export default constructorMethod;
