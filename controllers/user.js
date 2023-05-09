import userData from "../data/user.js";
import transactionData from "../data/transactions.js";
import landData from "../data/land.js";
import auth from "../data/credential.js";
import validation from "../utils/validation.js";
import {
  checkInputType,
  exists,
  validStateCodes,
  inputValidation,
  arrayLength,
} from "../utils/helpers.js";
import { ObjectId } from "mongodb";
import xss from "xss";

const getPropertiesOfUser = async (req, res) => {
  let id = req.params.id;
  // console.log(id);
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
  if (id != req.session.user.id) {
    //TODO Not authorized page
  }
  const profileSetUp = await auth.getCredentialByEmailId(
    req.session.user.email
  );
  if (!profileSetUp.profileSetUpDone) {
    let details = {};
    details.emailId = req.session.user.email;
    details.url = `/user/${req.session.user.id}/profile`;
    details.user = true;
    res.status(200).render("authentication/profileSetUp", {
      title: "Profile Set up",
      details,
    });
    return;
  }

  try {
    const user = await userData.getUserById(id);
    let avgRating = undefined;
    if (user.rating.count === 0) avgRating = 0;
    else avgRating = user.rating.totalRating / user.rating.count;
    res.status(200).render("profile", {
      title: "Profile",
      user: user,
      avgRating: avgRating,
      userId: req.session.user.id,
    });
  } catch (error) {
    res.status(404).render("error", {
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
      for (let i = 0; i < data.length; i++) {
        let land = await landData.getLand(data[i].landId);
        buyerTransaction.push({
          transactionId: data[i].transactionId,
          name: land.address,
          landId: data[i].landId,
          status: data[i].status,
        });
      }
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
      for (let i = 0; i < data.length; i++) {
        let land = await landData.getLand(data[i].landId);
        sellerTransaction.push({
          transactionId: data[i].transactionId,
          name: land.address,
          landId: data[i].landId,
          status: data[i].status,
        });
      }
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
  let transactionId = req.params.id;
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
    else role = "admin";
  } catch (error) {
    // // console.log("first error");
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
    // // console.log("second error");
    return res.status(400).render("Error", {
      title: "Error",
      hasError: true,
      error: [error.message],
    });
  }
  let sellerInfo = undefined;
  try {
    sellerInfo = await userData.getUserById(transaction.seller._id);
    sellerInfo._id = sellerInfo._id.toString();
  } catch (error) {
    // // console.log("third error");
    return res.status(400).render("Error", {
      title: "Error",
      hasError: true,
      error: [error.message],
    });
  }
  try {
    let land = await landData.getLand(transaction.land.toString());
    res.status(200).render("transactionDetails", {
      title: "Transaction Details",
      transaction: transaction,
      role: role,
      land: land,
      buyerInfo: buyerInfo,
      sellerInfo: sellerInfo,
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
  let {
    nameInput,
    phoneInput,
    emailIdInput,
    typeofGovernmentIdInput,
    governmentIdInput,
    dobInput,
    genderInput,
  } = req.body;
  try {
    nameInput = validation.validString(nameInput);
    phoneInput = validation.validPhone(phoneInput);
    emailIdInput = validation.validEmail(emailIdInput);
    typeofGovernmentIdInput = validation.validGovernmentIdType(
      typeofGovernmentIdInput
    );
    if (typeofGovernmentIdInput == "ssn") {
      governmentIdInput = validation.validSSN(governmentIdInput);
    } else {
      governmentIdInput = validation.validDriverLicense(governmentIdInput);
    }
    dobInput = validation.validDob(dobInput);
    genderInput = validation.validGender(genderInput);
  } catch (error) {
    res.status(400).render("authentication/profileSetUp", {
      title: "Profile set up",
      hasError: true,
      error: [error],
    });
    return;
  }
  // // console.log("here inside the set up profile");
  // // console.log("Session id here is", req.session.user.id);
  //TODO call create user
  try {
    const result = await userData.createUser(
      xss(nameInput),
      xss(phoneInput),
      xss(emailIdInput),
      xss(typeofGovernmentIdInput),
      xss(governmentIdInput),
      xss(dobInput),
      xss(genderInput)
    );
  } catch (error) {
    return res.status(500).render("Error", {
      title: "Error",
      hasError: true,
      error: [error],
    });
  }
  //TODO change profile status
  try {
    const result = await auth.updateProfileStatus(
      req.session.user.credentialId,
      true
    );
  } catch (error) {
    return res.status(500).render("Error", {
      title: "Error",
      hasError: true,
      error: [error],
    });
  }
  res.status(200).render("approvalWaiting", { title: "Approval Waiting" });
  return;
};

const postRateUser = async (req, res) => {
  let transactionId = req.params.id;
  let rate = parseInt(req.body.ratingInput);
  // let role = req.session.user.typeOfUser;/
  let userId = req.session.user.id;
  let error = [];
  if (!exists(transactionId)) error.push("ID parameter does not exists");
  if (!checkInputType(transactionId, "string"))
    error.push("ID must be of type string only");
  if (transactionId.trim().length === 0)
    error.push("ID cannot be of empty spaces");
  transactionId = transactionId.trim();
  if (!ObjectId.isValid(transactionId)) error.push("Invalid Object ID");
  if (!exists(rate)) error.push("Rate parameter does not exists");
  if (!checkInputType(rate, "number") || rate === NaN || rate === Infinity)
    error.push("rate must be of type number only");
  if (!Number.isInteger(rate)) error.push("rate cannot be in decimal place");
  if (rate < 0 || rate > 5) error.push("Rating must be between 0-5");
  if (error.length !== 0)
    return res.status(400).render("Error", {
      title: "Error",
      hasError: true,
      error: error,
    });

  try {
    await userData.addRatingToUser(userId, rate);
    return res.status(200).redirect("/user/transaction/" + transactionId);
  } catch (error) {
    return res.status(400).render("Error", {
      title: "Error",
      hasError: true,
      error: [error.message],
    });
  }
};

export {
  getPropertiesOfUser,
  getProfile,
  getTransactionsofUserID,
  setUpProfile,
  getTransactionDetails,
  postRateUser,
};
