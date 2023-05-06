import userData from "../data/user.js";
import transactionData from "../data/transactions.js";
import landData from "../data/land.js";
import auth from "../data/credential.js";
import {
  checkInputType,
  exists,
  validStateCodes,
  inputValidation,
  arrayLength,
} from "../utils/helpers.js";
import { ObjectId } from "mongodb";

const getPropertiesOfUser = async (req, res) => {
  let id = req.params.id;
  let error = [];
  if (!exists(id)) error.push("ID parameter does not exists");
  if (!checkInputType(id, "string"))
    error.push("ID must be of type string only");
  if (id.trim().length === 0) error.push("ID cannot be of empty spaces");
  id = id.trim();
  if (!ObjectId.isValid(id)) error.push("Invalid Object ID");
  if (error.length !== 0)
    return res.status(400).render("Error", {
      title: "Error",
      hasError: true,
      error: error,
    });

  try {
    const lands = await userData.getLandsOfUserID(id);
    let emptyLands = false;
    if (!arrayLength(lands, 1)) emptyLands = true;
    res.status(200).render("myProperties", {
      title: "Properties",
      lands: lands,
      emptyLands: emptyLands,
      userId: req.session.user.id,
    });
  } catch (error) {
    res.status(404).render("Error", {
      title: "Error",
      hasError: true,
      error: [error.message],
    });
  }
};

const getProfile = async (req, res) => {
  let id = req.params.id;
  let error = [];
  if (!exists(id)) error.push("ID parameter does not exists");
  if (!checkInputType(id, "string"))
    error.push("ID must be of type string only");
  if (id.trim().length === 0) error.push("ID cannot be of empty spaces");
  id = id.trim();
  if (!ObjectId.isValid(id)) error.push("Invalid Object ID");
  if (error.length !== 0)
    return res.status(400).render("Error", {
      title: "Error",
      hasError: true,
      error: error,
    });
    
    //check if session id matched url id
    if(id != req.session.user.id){
    //TODO Not authorized page
    
    }  
  const profileSetUp = await auth.getCredentialByEmailId(req.session.user.email);
  if(!profileSetUp.profileSetUpDone){
    let details ={};
    details.emailId = req.session.user.email;
    details.url = `/user/${req.session.user.id}/profile`;
    details.user = true;
    res.status(200).render("authentication/profileSetUp", {
      title: "Profile Set up", 
      details});
    return;
  }

  try {
    const user = await userData.getUserById(id);
    let avgRating = user.rating.totalRating / user.rating.count;
    res.status(200).render("Profile", {
      title: "Profile",
      user: user,
      avgRating: avgRating,
      userId: req.session.user.id,
    });
  } catch (error) {
    res.status(404).render("Error", {
      title: "Error",
      hasError: true,
      error: [error.message],
    });
  }
};

const getTransactionsofUserID = async (req, res) => {
  let id = req.params.id;
  let error = [];
  if (!exists(id)) error.push("ID parameter does not exists");
  if (!checkInputType(id, "string"))
    error.push("ID must be of type string only");
  if (id.trim().length === 0) error.push("ID cannot be of empty spaces");
  id = id.trim();
  if (!ObjectId.isValid(id)) error.push("Invalid Object ID");
  if (error.length !== 0)
    return res.status(400).render("Error", {
      title: "Error",
      hasError: true,
      error: error,
    });

  let buyerTransaction = [];
  let emptyBuyerTransaction = false;
  try {
    let data = await transactionData.getTransactionsByBuyerId(id);
    if (!arrayLength(data, 1)) emptyBuyerTransaction = true;
    else {
      data.forEach(async (element) => {
        let land = await landData.getLand(element.landId);
        buyerTransaction.push({
          transactionId: element.transactionId,
          name: land.address,
          landId: element.landId,
          status: element.status,
        });
      });
    }
  } catch (error) {
    return res.status(400).render("Error", {
      title: "Error",
      hasError: true,
      error: [error.message],
    });
  }

  let sellerTransaction = [];
  let emptySellerTransaction = false;
  try {
    let data = await transactionData.getTransactionsBySellerId(id);
    if (!arrayLength(data, 1)) emptySellerTransaction = true;
    else {
      data.forEach(async (element) => {
        let land = await landData.getLand(element.landId);
        sellerTransaction.push({
          transactionId: element.transactionId,
          name: land.address,
          landId: element.landId,
          status: element.status,
        });
      });
    }
    return res.status(200).render("myTransactions", {
      title: "Transactions",
      sellerTransaction: sellerTransaction,
      buyerTransaction: buyerTransaction,
      emptyBuyerTransaction: emptyBuyerTransaction,
      emptySellerTransaction: emptySellerTransaction,
      userId: req.session.user.id,
    });
  } catch (error) {
    return res.status(400).render("Error", {
      title: "Error",
      hasError: true,
      error: [error.message],
    });
  }
};

const getTransactionDetails = async (req, res) => {
  let transactionId = req.params.transactionId;
  let error = [];
  if (!exists(transactionId)) error.push("ID parameter does not exists");
  if (!checkInputType(transactionId, "string"))
    error.push("ID must be of type string only");
  if (transactionId.trim().length === 0)
    error.push("ID cannot be of empty spaces");
  transactionId = transactionId.trim();
  if (!ObjectId.isValid(transactionId)) error.push("Invalid Object ID");
  if (error.length !== 0)
    return res.status(400).render("Error", {
      title: "Error",
      hasError: true,
      error: error,
    });
  let role = req.session.user.typeOfUser;
  let transaction = undefined;
  try {
    transaction = await transactionData.getTransactionById(transactionId);
    transaction.buyer._id = transaction.buyer._id.toString();
    transaction.seller._id = transaction.seller._id.toString();
    if (transaction.buyer._id === req.session.user.id) role = "buyer";
    else if (transaction.seller._id === req.session.user.id) role = "seller";
  } catch (error) {
    return res.status(400).render("Error", {
      title: "Error",
      hasError: true,
      error: [error.message],
    });
  }
  let buyerInfo = undefined;
  try {
    buyerInfo = await userData.getUserById(transaction.buyer._id);
    buyerInfo._id = buyerInfo._id.toString();
  } catch (error) {
    return res.status(400).render("Error", {
      title: "Error",
      hasError: true,
      error: [error.message],
    });
  }
  try {
    let land = await landData.getLand(transaction.landId);
    res.status(200).render("transactionDetails", {
      title: "Transaction Details",
      transaction: transaction,
      role: role,
      land: land,
      buyerInfo: buyerInfo,
      userId: req.session.user.id,
    });
  } catch (error) {
    return res.status(400).render("Error", {
      title: "Error",
      hasError: true,
      error: [error.message],
    });
  }
};

const setUpProfile = async (req, res) => {

};
export {
  getPropertiesOfUser,
  getProfile,
  getTransactionsofUserID,
  setUpProfile,
  getTransactionDetails,
};
