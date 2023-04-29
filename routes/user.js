import express from "express";
const routes = express.Router();
import {
  getPropertiesOfUser,
  getProfile,
  getTransactionsofUserID,
} from "../controllers/user.js";

routes.route("/:id/land").get(getPropertiesOfUser);
routes.route("/:id/profile").get(getProfile);
routes.route("/:id/transactions").get(getTransactionsofUserID).post();

export default routes;
