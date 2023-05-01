import { Router } from "express";
const router = Router();

import {
  getAccountsForApproval,
  getLandsForApproval,
  getTransactionsForApproval
} from "../controllers/admin.js";

router.route('/profile').get((req, res) => {
  res.render('admin/adminHome', { title: 'Home' });
});

router.route('/approvals/account').get(getAccountsForApproval);
router.route('/approvals/account/:accountId').get().post();

router.route('/approvals/land').get(getLandsForApproval);
router.route('/approvals/land/:landId').get().post();

router.route('/approvals/transaction').get(getTransactionsForApproval);
router.route('/approvals/transaction/:transactionId').get().post();

export default router;