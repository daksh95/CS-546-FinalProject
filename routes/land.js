import express from "express";
const routes = express.Router();
import {
  getAllLand,
  getLand,
  updateLand,
  postLand,
  removeLand,
  getLandByState,
  postLandByState,
  postFilterArea,
  postFilterPrice,
} from "../Controllers/land.js";

routes.route("/").get(getLandByState).post(postLandByState);
routes.route("/area/:state").post(postFilterArea);
routes.route("/price/:state").post(postFilterPrice);
routes.route("/:id").get(getLand).patch(updateLand).delete(removeLand);

export default routes;
