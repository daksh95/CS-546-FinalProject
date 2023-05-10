import adminData from "../data/admin.js";
import validation from "../utils/validation.js";
import landData from "../data/land.js";
import transactionData from "../data/transactions.js";
import xss from "xss";
import userData from "../data/user.js";
import { getFullAddress } from "../utils/helpers.js";
import {
  checkInputType,
  exists,
  validStateCodes,
  inputValidation,
  arrayLength,
} from "../utils/helpers.js";

const getLandByState = async (req, res) => {
  try {
    let lands = await landData.getAllLand();
    let empty_lands = false;
    if (!arrayLength(lands, 1)) empty_lands = true;
    res.status(200).render("admin/adminHome", {
      title: "Lands",
      landByState: lands,
      state: undefined,
      empty_lands: empty_lands,
    });
  } catch (error) {
    res.status(404).render("Error", {
      title: "Error",
      hasError: true,
      error: [error.message],
    });
  }
};

const postLandByState = async (req, res) => {
  let state = req.body.state;
  if (!exists(state))
    return res.status(400).send({ message: "State not provided" });
  if (!checkInputType(state, "string"))
    return res
      .status(400)
      .send({ message: "State must be of type string only" });
  if (state.trim().length === 0)
    return res
      .status(400)
      .send({ message: "State cannot contain empty spaces only" });
  state = state.trim();
  if (!validStateCodes.includes(state.toUpperCase()))
    return res.status(400).send({
      message:
        "State parameter must be a valid statecode in abbreviations only",
    });

  try {
    let landByState = await landData.getLandByState(xss(state));
    let empty_lands = false;
    if (!arrayLength(landByState, 1)) empty_lands = true;
    return res.status(200).render("admin/adminHome", {
      title: "Lands",
      landByState: landByState,
      state: state,
      empty_lands: empty_lands,
      layout: false,
    });
    // return res.json(landByState);
  } catch (error) {
    return res.status(400).render("admin/adminHome", {
      title: "Lands",
      landByState: [],
      state: undefined,
      hasSearchError: true,
      error: [error.message],
    });
  }
};

const postFilterPrice = async (req, res) => {
  let state = req.params.state;
  let minPrice = parseInt(req.body.minPriceInput);
  let maxPrice = parseInt(req.body.maxPriceInput);
  let errors = [];
  try {
    state = inputValidation("state", state, "string").trim();
  } catch (error) {
    errors.push(error.message);
  }
  try {
    minPrice = inputValidation("minPrice", minPrice, "number");
  } catch (error) {
    errors.push(error.message);
  }
  try {
    maxPrice = inputValidation("maxPrice", maxPrice, "number");
  } catch (error) {
    errors.push(error.message);
  }
  if (!validStateCodes.includes(state.toUpperCase()))
    errors.push(
      "State parameter must be a valid statecode in abbreviations only"
    );
  if (maxPrice < minPrice) errors.push("maxPrice cannot be less than minPrice");
  if (errors.length !== 0)
    return res.status(400).render("admin/adminHome", {
      title: "Lands",
      landByState: [],
      state: state,
      hasError: true,
      error: errors,
    });

  try {
    let filteredLands = await landData.filterByPrice(xss(state), minPrice, maxPrice);
    let empty_lands = false;
    if (!arrayLength(filteredLands, 1)) empty_lands = true;
    return res.status(200).render("admin/adminHome", {
      title: "Lands",
      landByState: filteredLands,
      state: state,
      empty_lands: empty_lands,
    });
  } catch (error) {
    return res.status(400).render("admin/adminHome", {
      title: "Lands",
      landByState: [],
      state: state,
      hasError: true,
      error: [error.message],
    });
  }
};

const postFilterArea = async (req, res) => {
  let state = req.params.state;
  let minArea = parseInt(req.body.minAreaInput);
  let maxArea = parseInt(req.body.maxAreaInput);
  let errors = [];
  try {
    state = inputValidation("state", state, "string").trim();
  } catch (error) {
    errors.push(error.message);
  }
  try {
    minArea = inputValidation("minArea", minArea, "number");
  } catch (error) {
    errors.push(error.message);
  }
  try {
    maxArea = inputValidation("maxArea", maxArea, "number");
  } catch (error) {
    errors.push(error.message);
  }
  if (!validStateCodes.includes(state.toUpperCase()))
    errors.push(
      "State parameter must be a valid statecode in abbreviations only"
    );
  if (maxArea < minArea) errors.push("maxArea cannot be less than minArea");
  if (errors.length !== 0)
    return res.status(400).render("admin/adminHome", {
      title: "Lands",
      landByState: [],
      state: state,
      hasError: true,
      error: errors,
    });

  try {
    let filteredLands = await landData.filterByArea(xss(state), minArea, maxArea);
    let empty_lands = false;
    if (!arrayLength(filteredLands, 1)) empty_lands = true;
    return res.status(200).render("admin/adminHome", {
      title: "Lands",
      landByState: filteredLands,
      state: state,
      empty_lands: empty_lands,
    });
  } catch (error) {
    return res.status(400).render("admin/adminHome", {
      title: "Lands",
      landByState: [],
      state: state,
      hasError: true,
      error: [error.message],
    });
  }
};

const getAdminHome = async (req, res) => {
  try {
    const accountList = await adminData.getUnapprovedAccounts();
    console.log(accountList);
    const landList = await adminData.getUnapprovedLands();
    const transactionList = await adminData.getUnapprovedTransactions();
  
    if (!accountList || !landList || !transactionList)
      return res.status(500).render('error', { title: 'Error', hasError: true, error: ['Internal Server Error'] });
  
    const pendingAccounts = accountList.length;
    const pendingLands = landList.length;
    const pendingTransactions = transactionList.length;

    console.log(`pendingAccounts: ${pendingAccounts}`)
    console.log(`pendingLands: ${pendingLands}`)
    console.log(`pendingTransactions: ${pendingTransactions}`)
  
    res.render('admin/adminHome', { 
      title: 'Home', pendingAccounts,
      pendingLands, pendingTransactions
      });
  } catch (error) {
    return res.status(400).render('error', { title: 'Error', hasError: true, error: [error] });
  }
}

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
  let account;

  try {
    accountId = validation.validObjectId(accountId, 'accountId');
  } catch (error) {
    return res.status(400).render('error', { title: 'Error', hasError: true, error: [error] });
  }
  
  try {
    account = await adminData.getAccountById(accountId);
  } catch (error) {
    return res.status(404).render('error', { title: 'Error', hasError: true, error: [error] });
  }

  try {
    if (!account) return res.status(500).render('error', { title: 'Error', hasError: true, error: ['Internal Server Error'] });
    const isUser = account.role.toLowerCase() === 'user';
    const isEntity = !isUser;

    const isPending = account.approved.toLowerCase() === 'pending';
    const isApproved = account.approved.toLowerCase() === 'approved';
    const isRejected = account.approved.toLowerCase() === 'rejected';

    const profileSetUpDone = account.credentialInfo.profileSetUpDone;
    let landsCount = 0;
    if (isUser) landsCount = account.land.length;

    const accountTransactions = await transactionData.getTransactionsForAccount(accountId);
    if (!accountTransactions) return res.status(500).render('error', { title: 'Error', hasError: true, error: ['Internal Server Error'] });
    console.log(accountTransactions);
    let transactionCount = accountTransactions.length;

    return res.render('admin/approveAccount', {
      title: "Approve Account",
      account, isUser, isEntity,
      isPending, isApproved, isRejected, profileSetUpDone,
      landsCount, transactionCount
    });
  } catch (error) {
    return res.status(400).render('error', { title: 'Error', hasError: true, error: [error] });
  }
};

const approveAccount = async (req, res) => {
  const approvalInfo = req.body;

  try {
    if (!('approval' in approvalInfo && 'comment' in approvalInfo))
    throw 'Request header does not match the correct format';

    const status = validation.validApprovalStatus(approvalInfo.approval, 'Approval Status');
    let comment = approvalInfo.comment;
    if (status === 'rejected') comment = validation.validString(comment, 'Approval Comment');
    const accountId = validation.validObjectId(req.params.accountId, 'accountId');
    const approvalResult = await adminData.approveAccount(accountId, xss(status), xss(comment));
    if (!approvalResult) return res.status(500).render('error', { title: 'Error', hasError: true, error: ['Internal Server Error'] });
    return res.redirect(`/admin/account/${accountId}`)
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
    return res.redirect(`/admin/land/${landId}`)
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
  let transaction;

  try {
    transactionId = validation.validObjectId(transactionId, 'transactionId');
  } catch (error) {
    return res.status(400).render('error', { title: 'Error', hasError: true, error: [error] });
  }

  try {
    transaction = await transactionData.getTransactionById(transactionId);
    if (!transaction) return res.status(500).render('error', { title: 'Error', hasError: true, error: ['Internal Server Error'] });
  } catch (error) {
    return res.status(404).render('error', { title: 'Error', hasError: true, error: [error] });
  }

  try {
    transaction.buyer._id = transaction.buyer._id.toString();
    transaction.seller._id = transaction.seller._id.toString();
    transaction.land = transaction.land.toString();

    let surveyorExists = false;
    let titleCompanyExists = false;
    let governmentExists = false;

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
    const land = await landData.getLand(transaction.land);
    land.fullAddress = getFullAddress(land.address);
    
    if (!buyer || !seller || !land) return res.status(500).render('error', { title: 'Error', hasError: true, error: ['Internal Server Error'] });

    return res.render('admin/approveTransaction', {
      title: "Approve Transaction", transaction, isPending, isApproved, isRejected,
      approvalRequired, buyer, seller, surveyorExists, titleCompanyExists,
      governmentExists, land
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
    return res.redirect(`/admin/transaction/${transactionId}`)
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
  approveTransaction,
  getAdminHome,
  getLandByState,
  postLandByState,
  postFilterPrice,
  postFilterArea
};