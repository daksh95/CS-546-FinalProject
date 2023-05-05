import { Router } from "express";
const router = Router();

import {
  getHome,
  allTransacs,
  pendingTransacs,
  transDetails,
} from "../controllers/entities";

router.route("/entity").get(getHome);

router.route("/entity/myProfile").get((req, res) => {
  res.render("entity/profile", { title: "My Profile" });
});

router.route("/entity/allTransactions/:entityId").get(allTransacs);
router.route("/entity/pendingTransactions/:entityId").get(pendingTransacs);
router.route("/entity/transactionDetails/:transactionId").get(transDetails);

export default router;
