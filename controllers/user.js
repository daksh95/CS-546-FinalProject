import userData from "../data/user.js";
import transactionData from "../data/transactions.js";
import landData from "../data/land.js";
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

  try {
    const user = await userData.getUserById(id);
    let avgRating = user.rating.totalRating / user.rating.count;
    res.status(200).render("Profile", {
      title: "Profile",
      user: user,
      avgRating: avgRating,
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
    if (!arrayLength(emptyBuyerTransaction, 1)) emptyBuyerTransaction = true;
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
    });
  } catch (error) {
    return res.status(400).render("Error", {
      title: "Error",
      hasError: true,
      error: [error.message],
    });
  }
};

const getTransactionDetails = async (req, res) => {};

const setUpProfile = async (req, res) => {};
export {
  getPropertiesOfUser,
  getProfile,
  getTransactionsofUserID,
  setUpProfile,
  getTransactionDetails,
};
