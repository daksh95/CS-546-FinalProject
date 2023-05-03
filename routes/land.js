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
} from "../controllers/land.js";

routes.route("/").get(getAllLand).post(postLandByState);
routes.route("/area/:state").post(postFilterArea);
routes.route("/price/:state").post(postFilterPrice);
routes.route("/:id").get(getLand);

export default routes;
