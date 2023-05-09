import adminData from "../data/admin.js";
import validation from "../utils/validation.js";
import landData from "../data/land.js";
import transactionData from "../data/transactions.js";
import xss from "xss";
import userData from "../data/user.js";
import { getFullAddress } from "../utils/helpers.js";


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

    const approvalRequired = account.credentialInfo.profileSetUpDone;
    let landsCount = 0;
    if (isUser) landsCount = account.land.length;

    const accountTransactions = await transactionData.getTransactionsForAccount(accountId);
    if (!accountTransactions) return res.status(500).render('error', { title: 'Error', hasError: true, error: ['Internal Server Error'] });
    let transactionCount = accountTransactions.length;

    return res.render('admin/approveAccount', {
      title: "Approve Account",
      account, isUser, isEntity,
      isPending, isApproved, isRejected, approvalRequired,
      landsCount, transactionCount
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
    const approvalResult = await adminData.approveAccount(accountId, xss(status), xss(comment));
    if (!approvalResult) return res.status(500).render('error', { title: 'Error', hasError: true, error: ['Internal Server Error'] });
    return res.redirect(`/admin/approvals/account/${accountId}`)
  } catch (error) {
    return res.status(400).render('error', { title: 'Error', hasError: true, error: [error] });
  }
}

const getLandsListForApproval = async (req, res) => {
  try {
    let landList = await adminData.getUnapprovedLands();

    if (!landList) return res.status(500).render('error', { title: 'Error', hasError: true, error: ['Internal Server Error'] });

    const landsExist = landList.length !== 0 ? true : false;
    return res.render('admin/landApprovalList', { title: 'Land Approvals', landsExist, landList });
  } catch (e) {
    return res.status(400).render('error', { title: 'Error', hasError: true, error: [e] });
  }
};

const getApprovalLand = async (req, res) => {
  let landId = req.params.landId;
  try {
    landId = validation.validObjectId(landId, 'landId');
    const land = await landData.getLand(landId);
    if (!land) return res.status(500).render('error', { title: 'Error', hasError: true, error: ['Internal Server Error'] });

    land.fullAddress = getFullAddress(land.address);

    land.approved = validation.validApprovalStatus(land.approved)

    const isPending = land.approved.toLowerCase() === 'pending';
    const isApproved = land.approved.toLowerCase() === 'approved';
    const isRejected = land.approved.toLowerCase() === 'rejected';

    const owner = await userData.getOwnerByLandId(landId);
    if (!owner) return res.status(500).render('error', { title: 'Error', hasError: true, error: ['Internal Server Error'] });

    let transactions = [];
    try {
      transactions = await transactionData.getTransactionsByLandId(landId);
    } catch (error) {
      // pass
    }
    if (!transactions) return res.status(500).render('error', { title: 'Error', hasError: true, error: ['Internal Server Error'] });
    const transactionsCount = transactions.length;
    
    return res.render('admin/approveLand', {
      title: "Approve Land", land, isPending, isApproved, isRejected, owner, transactionsCount, transactions
    });
  } catch (error) {
    return res.status(400).render('error', { title: 'Error', hasError: true, error: [error] });
  }
}

const approveLand = async (req, res) => {
  const approvalInfo = req.body;

  try {
    if (!('approval' in approvalInfo && 'comment'))
    throw 'Request header does not match the correct format';

    const status = validation.validApprovalStatus(approvalInfo.approval, 'Approval Status');
    let comment = approvalInfo.comment;
    if (status === 'rejected') comment = validation.validString(comment, 'Approval Comment');
    const landId = validation.validObjectId(req.params.landId, 'landId');
    const approvalResult = await adminData.approveLand(landId, xss(status), xss(comment));
    if (!approvalResult) return res.status(500).render('error', { title: 'Error', hasError: true, error: ['Internal Server Error'] });
    return res.redirect(`/admin/approvals/land/${landId}`)
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
  let transactionId = req.params.transactionId;

  try {
    transactionId = validation.validObjectId(transactionId, 'transactionId');
    const transaction = await transactionData.getTransactionById(transactionId);
    if (!transaction) return res.status(500).render('error', { title: 'Error', hasError: true, error: ['Internal Server Error'] });

    transaction.buyer._id = transaction.buyer._id.toString();
    transaction.seller._id = transaction.seller._id.toString();
    transaction.land = transaction.land.toString();

    let surveyorExists = false;
    let titleCompanyExists = false;
    let governmentExists = false;
    let adminExists = false;

    if ('surveyor' in transaction && '_id' in transaction.surveyor && transaction.surveyor._id) {
      transaction.surveyor._id = transaction.surveyor._id.toString();
      transaction.surveyor._id = validation.validObjectId(transaction.surveyor._id, 'surveyorId');
      transaction.surveyor.status = validation.validApprovalStatus(transaction.surveyor.status, 'surveyor transaction status');
      transaction.surveyor.info = await adminData.getAccountById(transaction.surveyor._id);
      surveyorExists = true;
    }

    if ('titleCompany' in transaction && '_id' in transaction.titleCompany && transaction.titleCompany._id) {
      transaction.titleCompany._id = transaction.titleCompany._id.toString();
      transaction.titleCompany._id = validation.validObjectId(transaction.titleCompany._id, 'titleCompanyId');
      transaction.titleCompany.status = validation.validApprovalStatus(transaction.titleCompany.status, 'titleCompany transaction status');
      transaction.titleCompany.info = await adminData.getAccountById(transaction.titleCompany._id);
      titleCompanyExists = true;
    }

    if ('government' in transaction && '_id' in transaction.government && transaction.government._id) {
      transaction.government._id = transaction.government._id.toString();
      transaction.government._id = validation.validObjectId(transaction.government._id, 'governmentId');
      transaction.government.status = validation.validApprovalStatus(transaction.government.status, 'government transaction status');
      transaction.government.info = await adminData.getAccountById(transaction.government._id);
      governmentExists = true;
    }

    if ('admin' in transaction && '_id' in transaction.admin && transaction.admin._id) {
      transaction.admin._id = transaction.admin._id.toString();
      transaction.admin._id = validation.validObjectId(transaction.admin._id, 'adminId');
      adminExists = true;
    }
    transaction.status = validation.validApprovalStatus(transaction.status, 'Transaction Status');

    const approvalRequired = transaction.surveyor.status === "approved" &&
    transaction.titleCompany.status === "approved" &&
    transaction.government.status === "approved" &&
    transaction.status === "pending";

    const isPending = transaction.status.toLowerCase() === 'pending';
    const isApproved = transaction.status.toLowerCase() === 'approved';
    const isRejected = transaction.status.toLowerCase() === 'rejected';

    const buyer = await userData.getUserById(transaction.buyer._id);
    const seller = await userData.getUserById(transaction.seller._id);
    if (!buyer || !seller) return res.status(500).render('error', { title: 'Error', hasError: true, error: ['Internal Server Error'] });

    return res.render('admin/approveTransaction', {
      title: "Approve Transaction", transaction, isPending, isApproved, isRejected,
      approvalRequired, buyer, seller, surveyorExists, titleCompanyExists,
      governmentExists, adminExists
    });
  } catch (error) {
    return res.status(400).render('error', { title: 'Error', hasError: true, error: [error] });
  }
}

const approveTransaction = async (req, res) => {
  const approvalInfo = req.body;

  try {
    if (!('approval' in approvalInfo && 'comment'))
    throw 'Request header does not match the correct format';

    const status = validation.validApprovalStatus(approvalInfo.approval, 'Approval Status');
    let comment = approvalInfo.comment;
    if (status === 'rejected') comment = validation.validString(comment, 'Approval Comment');
    const transactionId = validation.validObjectId(req.params.transactionId, 'transactionId');
    
    const approvalResult = await adminData.approveTransaction(transactionId, xss(status), xss(comment));
    if (!approvalResult) return res.status(500).render('error', { title: 'Error', hasError: true, error: ['Internal Server Error'] });
    return res.redirect(`/admin/approvals/transaction/${transactionId}`)
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
  approveAccount,
  approveLand,
  approveTransaction
};