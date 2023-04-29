import landRoutes from "./land.js";
import userRoutes from "./user.js";
import transactionRoutes from "./transaction.js";

const constructorMethod = (app) => {
  app.use("/land", landRoutes);
  app.use("/user", userRoutes);
  app.use("/transactions", transactionRoutes);
  app.use("*", (req, res) => {
    res.status(400).json({ error: "Not Found" });
  });
};

export default constructorMethod;
