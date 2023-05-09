import { Router } from "express";
const router = Router();

import {
  getAccountsListForApproval,
  getLandsListForApproval,
  getTransactionsListForApproval,
  getApprovalAccount,
  getApprovalLand,
  getApprovalTransaction,
  approveAccount,
  approveLand,
  approveTransaction,
  getAdminHome
} from "../controllers/admin.js";

router.route('/').get(getAdminHome);

router.route('/approvals/account').get(getAccountsListForApproval);
router.route('/account/:accountId').get(getApprovalAccount).post(approveAccount);

router.route('/approvals/land').get(getLandsListForApproval);
router.route('/land/:landId').get(getApprovalLand).post(approveLand);

router.route('/approvals/transaction').get(getTransactionsListForApproval);
router.route('/transaction/:transactionId').get(getApprovalTransaction).post(approveTransaction);

export default router;