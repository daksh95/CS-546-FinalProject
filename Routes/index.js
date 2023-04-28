import landRoutes from "./land.js";
import userRoutes from "./user.js";

const constructorMethod = (app) => {
  app.use("/land", landRoutes);
  app.use("/user", userRoutes);
  app.use("*", (req, res) => {
    res.status(400).json({ error: "Not Found" });
  });
};

export default constructorMethod;
