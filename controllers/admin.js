import adminData from "../data/admin.js";

const getAccountsForApproval = async (req, res) => {
  try {
    const accountList = await adminData.getUnapprovedAccounts();

    if (!accountList) return res.status(500).render('error', { hasError: true, error: ['Internal Server Error'] });

    const accountsExist = accountList.length !== 0 ? true : false;
    return res.render('admin/accountApprovalList', { title: 'Account Approvals', accountsExist, accountList });
  } catch (e) {
    return res.status(400).render('error', { hasError: true, error: [e] });
  }
};

const getLandsForApproval = async (req, res) => {
  try {
    const landList = await adminData.getUnapprovedLands();

    if (!landList) return res.status(500).render('error', { hasError: true, error: ['Internal Server Error'] });

    const landsExist = landList.length !== 0 ? true : false;
    return res.render('admin/landApprovalList', { title: 'Land Approvals', landsExist, landList });
  } catch (e) {
    return res.status(400).render('error', { hasError: true, error: [e] });
  }
};

const getTransactionsForApproval = async (req, res) => {
  try {
    const transactionList = await adminData.getUnapprovedTransactions();

    if (!transactionList) return res.status(500).render('error', { hasError: true, error: ['Internal Server Error'] });

    const transactionsExist = transactionList.length !== 0 ? true : false;
    return res.render('admin/transactionApprovalList', { title: 'Transaction Approvals', transactionsExist, transactionList });
  } catch (e) {
    return res.status(400).render('error', { hasError: true, error: [e] });
  }
};

export {
  getAccountsForApproval,
  getLandsForApproval,
  getTransactionsForApproval
};