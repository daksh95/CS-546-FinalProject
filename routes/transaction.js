import express from "express";
const routes = express.Router();
import { getAllTransactionsofLand } from "../controllers/transaction.js";

routes.route("/land/:landId").get(getAllTransactionsofLand);

export default routes;
