import transactionData from "../data/transactions.js";  
import {
  checkInputType,
  exists,
  validStateCodes,
  inputValidation,
} from "../utils/helpers.js";
import { ObjectId } from "mongodb";

const getAllTransactionsofLand = async (req, res) => {
  let landId = req.params.landId;
  let error = [];
  if (!exists(landId)) error.push("ID parameter does not exists");
  if (!checkInputType(landId, "string"))
    error.push("ID must be of type string only");
  if (landId.trim().length === 0) error.push("ID cannot be of empty spaces");
  landId = landId.trim();
  if (!ObjectId.isValid(landId)) error.push("Invalid Object ID");
  if (error.length !== 0)
    return res.status(400).render("Error", {
      title: "Error",
      hasError: true,
      error: error,
    });
  try {
    let transactions = await transactionData.getTransactionsByLandId(landId);
    return res.status(200).render("getTransactionsofLand", {
      title: "Land Transactions",
      transactions: transactions,
    });
  } catch (error) {
    return res.status(400).render("Error", {
      title: "Error",
      hasError: true,
      error: [error.message],
    });
  }
};

export { getAllTransactionsofLand };
