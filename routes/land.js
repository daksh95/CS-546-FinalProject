import express from "express";
const routes = express.Router();
import {
  getLand,
  updateLand,
  getLandByState,
  postLandByState,
  postFilterArea,
  postFilterPrice,
  placedBid,
  addNewLand,
  addNewLandForm,
  postLandonSale,
} from "../controllers/land.js";

routes.route("/").get(getLandByState).post(postLandByState);
routes.route("/area/:state").post(postFilterArea);
routes.route("/price/:state").post(postFilterPrice);
routes.route("/:id").get(getLand).post(postLandonSale);
routes.route("/:landId/:sellerId").post(placedBid);
routes.route(":id/edit").get(updateLand).patch(updateLand);
export default routes;
