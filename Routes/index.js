import landRoutes from "./land.js";

const constructorMethod = (app) => {
  app.use("/land", landRoutes);
  app.use("*", (req, res) => {
    res.status(400).json({ error: "Not Found" });
  });
};

export default constructorMethod;
