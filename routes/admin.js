import { Router } from "express";
const router = Router();

import {
  getAccountsListForApproval,
  getLandsListForApproval,
  getTransactionsListForApproval,
  getApprovalAccount,
  getApprovalLand,
  getApprovalTransaction
} from "../controllers/admin.js";

router.route('/profile').get((req, res) => {
  res.render('admin/adminHome', { title: 'Home' });
});

router.route('/approvals/account').get(getAccountsListForApproval);
router.route('/approvals/account/:accountId').get(getApprovalAccount).post();

router.route('/approvals/land').get(getLandsListForApproval);
router.route('/approvals/land/:landId').get(getApprovalLand).post();

router.route('/approvals/transaction').get(getTransactionsListForApproval);
router.route('/approvals/transaction/:transactionId').get(getApprovalTransaction).post();

export default router;