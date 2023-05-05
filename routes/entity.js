import { Router } from "express";
const router = Router();

import {
  getHome,
  getProfile,
  allTransacs,
  pendingTransacs,
  transDetails,
} from "../controllers/entities.js";

router.route("/").get(getHome);

router.route("/myProfile").get(getProfile);

router.route("/allTransactions/:entityId").get(allTransacs);
router.route("/pendingTransactions/:entityId").get(pendingTransacs);
router.route("/transactionDetails/:transactionId").get(transDetails).post();

export default router;
