import { Router } from "express";
const router = Router();

import {
  getHome,
  getProfile,
  setUpProfile,
  updationFrom,
  update,
  allTransacs,
  pendingTransacs,
  transDetails,
  response,
} from "../controllers/entities.js";

router.route("/").get(getHome);

router.route("/myProfile").get(getProfile).post(setUpProfile);
router.route("/updateProfile/:entityId").get(updationFrom).post(update);

router.route("/allTransactions/:entityId").get(allTransacs);
router.route("/pendingTransactions/:entityId").get(pendingTransacs);
router
  .route("/:entityId/transactionDetails/:transactionId")
  .get(transDetails)
  .post(response);

export default router;
