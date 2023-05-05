import express from "express";
const routes = express.Router();
import {
  getAllTransactionsofLand,
  sellerApproved,
} from "../controllers/transaction.js";

routes.route("/land/:landId").get(getAllTransactionsofLand);
routes.route("/:transactionId/:sellerId/:value").patch(sellerApproved);

export default routes;
