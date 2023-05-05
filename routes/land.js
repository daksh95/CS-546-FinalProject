import express from "express";
const routes = express.Router();
import {
  getLand,
  updateLand,

  removeLand,
  getLandByState,
  postLandByState,
  postFilterArea,
  postFilterPrice,
  placedBid,
} from "../controllers/land.js";

routes.route("/").get(getLandByState).post(postLandByState);
routes.route("/area/:state").post(postFilterArea);
routes.route("/price/:state").post(postFilterPrice);
routes.route("/:id").get(getLand)
routes.route("/:landId/:sellerId").post(placedBid);
routes.route("/land").post()
export default routes;
