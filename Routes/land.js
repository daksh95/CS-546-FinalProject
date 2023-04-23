import express from "express";
const routes = express.Router();
import {
  getAllLand,
  getLand,
  updateLand,
  postLand,
  removeLand,
  getLandByState,
  postLandByState
} from "../Controllers/land.js";

routes.route("/").get(getLandByState).post(postLandByState);
routes.route("/:id").get(getLand).patch(updateLand).delete(removeLand);

export default routes;
