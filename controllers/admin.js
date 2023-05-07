import adminData from "../data/admin.js";
import validation from "../utils/validation.js";
import landData from "../data/land.js";
import transactionData from "../data/transactions.js";


const getAccountsListForApproval = async (req, res) => {
  try {
    const accountList = await adminData.getUnapprovedAccounts();

    if (!accountList) return res.status(500).render('error', { title: 'Error', hasError: true, error: ['Internal Server Error'] });

    const accountsExist = accountList.length !== 0 ? true : false;
    return res.render('admin/accountApprovalList', { title: 'Account Approvals', accountsExist, accountList });
  } catch (e) {
    return res.status(400).render('error', { title: 'Error', hasError: true, error: [e] });
  }
};

const getApprovalAccount = async (req, res) => {
  let accountId = req.params.accountId;
  
  try {
    accountId = validation.validObjectId(accountId, 'accountId');
    const account = await adminData.getAccountById(accountId);
    if (!account) return res.status(500).render('error', { title: 'Error', hasError: true, error: ['Internal Server Error'] });
    const isUser = account.role.toLowerCase() === 'user';
    const isEntity = !isUser;

    const isPending = account.approved.toLowerCase() === 'pending';
    const isApproved = account.approved.toLowerCase() === 'approved';
    const isRejected = account.approved.toLowerCase() === 'rejected';

    return res.render('admin/approveAccount', {
      title: "Approve Account",
      account, isUser, isEntity,
      isPending, isApproved, isRejected
    });
  } catch (error) {
    return res.status(400).render('error', { title: 'Error', hasError: true, error: [error] });
  }
};

const approveAccount = async (req, res) => {
  const approvalInfo = req.body;

  try {
    if (!('approval' in approvalInfo && 'comment'))
    throw 'Request header does not match the correct format';

    const status = validation.validApprovalStatus(approvalInfo.approval, 'Approval Status');
    let comment = approvalInfo.comment;
    if (status === 'rejected') comment = validation.validString(comment, 'Approval Comment');
    const accountId = validation.validObjectId(req.params.accountId, 'accountId');
    const approvalResult = await adminData.approveAccount(accountId, status, comment);
    if (!approvalResult) return res.status(500).render('error', { title: 'Error', hasError: true, error: ['Internal Server Error'] });
    return res.redirect(`/admin/approvals/account/${accountId}`)
  } catch (error) {
    return res.status(400).render('error', { title: 'Error', hasError: true, error: [error] });
  }
}

const getLandsListForApproval = async (req, res) => {
  try {
    const landList = await adminData.getUnapprovedLands();

    if (!landList) return res.status(500).render('error', { title: 'Error', hasError: true, error: ['Internal Server Error'] });

    const landsExist = landList.length !== 0 ? true : false;
    return res.render('admin/landApprovalList', { title: 'Land Approvals', landsExist, landList });
  } catch (e) {
    return res.status(400).render('error', { title: 'Error', hasError: true, error: [e] });
  }
};

const getApprovalLand = async (req, res) => {
  const landId = req.params.landId;

  try {
    landId = validation.validObjectId(landId, 'landId');
    const land = await landData.getLand(landId);
    if (!land) return res.status(500).render('error', { title: 'Error', hasError: true, error: ['Internal Server Error'] });

    const isPending = land.approved.toLowerCase() === 'pending';
    const isApproved = land.approved.toLowerCase() === 'approved';
    const isRejected = land.approved.toLowerCase() === 'rejected';
    
    return res.json(land);
  } catch (error) {
    return res.status(400).render('error', { title: 'Error', hasError: true, error: [error] });
  }
}

const getTransactionsListForApproval = async (req, res) => {
  try {
    const transactionList = await adminData.getUnapprovedTransactions();

    if (!transactionList) return res.status(500).render('error', { title: 'Error', hasError: true, error: ['Internal Server Error'] });

    const transactionsExist = transactionList.length !== 0 ? true : false;
    return res.render('admin/transactionApprovalList', { title: 'Transaction Approvals', transactionsExist, transactionList });
  } catch (e) {
    return res.status(400).render('error', { title: 'Error', hasError: true, error: [e] });
  }
};

const getApprovalTransaction = async (req, res) => {
  const transactionId = req.params.transactionId;

  try {
    transactionId = validation.validObjectId(transactionId, 'transactionId');
    const transaction = await transactionData.getTransactionById(transactionId);
    if (!transaction) return res.status(500).render('error', { title: 'Error', hasError: true, error: ['Internal Server Error'] });

    const isPending = transaction.approved.toLowerCase() === 'pending';
    const isApproved = transaction.approved.toLowerCase() === 'approved';
    const isRejected = transaction.approved.toLowerCase() === 'rejected';

    return res.json(transaction);
  } catch (error) {
    return res.status(400).render('error', { title: 'Error', hasError: true, error: [error] });
  }
}

export {
  getAccountsListForApproval,
  getApprovalAccount,
  getLandsListForApproval,
  getApprovalLand,
  getTransactionsListForApproval,
  getApprovalTransaction,
  approveAccount
};