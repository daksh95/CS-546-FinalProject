import { Router } from "express";
const router = Router();

router.route('/approvals/account').get();
router.route('/approvals/account/:accountId').get().post();

router.route('/approvals/land').get();
router.route('/approvals/land/:landId').get().post();

router.route('/approvals/transaction').get();
router.route('/approvals/transaction/:transactionId').get().post();

export default router;