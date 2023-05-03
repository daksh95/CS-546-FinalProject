import express from "express";
const routes = express.Router();
import {
  getPropertiesOfUser,
  getProfile,
  getTransactionsofUserID,
  setUpProfile
} from "../controllers/user.js";

routes.route("/:id/land").get(getPropertiesOfUser);
routes.route("/:id/profile").get(getProfile).post(setUpProfile);
routes.route("/:id/transactions").get(getTransactionsofUserID).post();

export default routes;
