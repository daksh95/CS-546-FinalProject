import landRoutes from "./land.js";

const constructorMethod = (app) => {
  app.use("/land", landRoutes);
};

export default constructorMethod;
