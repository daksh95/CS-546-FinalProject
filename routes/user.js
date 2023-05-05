import express from "express";
const routes = express.Router();
import {
  getPropertiesOfUser,
  getProfile,
  getTransactionsofUserID,
  setUpProfile,
  getTransactionDetails,
} from "../controllers/user.js";

routes.route("/:id/land").get(getPropertiesOfUser);
routes.route("/:id/profile").get(getProfile).post(setUpProfile);
routes.route("/:id/transactions").get(getTransactionsofUserID);
routes.route("/transaction/:id").get(getTransactionDetails);

export default routes;
