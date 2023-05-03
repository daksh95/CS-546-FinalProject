import { ObjectId } from "mongodb";
import validation from "../utils/validation.js";
import { getClient } from "../config/connection.js";
import { inputValidation } from "../utils/helpers.js";

//fetch all the information about the a single land from transaction collection
const getTransactionsByBuyerId = async (id) => {
  id = validation.validObjectId(id, "Buyer Id");
  const client = getClient();
  const result = client
    .collection("transaction")
    .find({ buyer: new ObjectId(id) })
    .toArray();
  //get land by Id,
  //get status;
  const data = [];
  for (let i = 0; i < result.length; i++) {
    data[i] = {
      landId: result[i].landId,
      status: result[i].status,
    };
  }

  return data;
};

const getTransactionsBySellerId = async (id) => {
  id = validation.validObjectId(id, "Seller Id");
  const client = getClient();
  const result = client
    .collection("transaction")
    .find({ seller: new ObjectId(id) })
    .toArray();
  //get land by Id,
  //get status;
  const data = {
    landId: result.landId,
    status: result.status,
  };
  return data;
};

const getTransactionsByLandId = async (id) => {
  id = validation.validObjectId(id, "land Id");
  const client = getClient();
  const result = client
    .collection("transaction")
    .find({ landId: new ObjectId(id) }, { _id: 0, buyer: 1, status: 1 })
    .toArray();
  if (result.lenght < 1) {
    throw "No transaction from that ID";
  }
  // Get users by ID.
  const { name: buyerName } = await userData.getUserById(result.buyer.id);
  //
  const data = {
    buyer: buyerName,
    bid: result.buyer.bid,
    status: result.status,
  };
  return data;
};

const sellerApproved = async (transactionId, sellersId) => {
  //update will happen if and only if it is done by seller. Therefore, seller's ID is needed to authenticate.
  transactionId = validation.validObjectId(transactionId, "transactionId");
  sellersId = validation.validObjectId(sellersId, "sellersId");
  const client = getClient();
  const result = await client
    .collection("transaction")
    .findOneAndUpdate(
      { _id: new ObjectId(transactionId), seller: new ObjectId(sellersId) },
      { sellersStatus: true },
      { returnDocument: "after" }
    );
  if (result.lastErrorObject.n < 1) {
    throw "could not be approved";
  }
  return result;
};

const createTransaction = async (
  landId,
  landPrice,
  buyerPrice,
  buyerId,
  sellerId,
  status,
  surveyorId,
  surveyorApproval,
  surveyorComment,
  titleCompanyId,
  titleCompanyApproval,
  titleCompanyComment,
  governmentId,
  governmentApproval,
  governmentComment,
  adminId,
  adminApproval,
  adminComment
) => {};

const terminateTransaction = async (transactionId, adminComment) => {
  transactionId = validation.validObjectId(transactionId, "transactionId");
  const client = getClient();
  const result = await client
    .collection("transaction")
    .findOneAndUpdate(
      { _id: new ObjectId(transactionId) },
      {
        $set: {
          status: "Terminated",
          "admin.status": false,
          "admin.Comment": adminComment,
        },
      },
      { returnDocument: "after" }
    );
  if (result.lastErrorObject.n < 1) {
    throw "transaction could not be terminated";
  }
  return result;
};

const updateBid = async (transactionId, bidAmount) => {};

const transactionData = {
  getTransactionsByBuyerId: getTransactionsByBuyerId,
  getTransactionsBySellerId: getTransactionsBySellerId,
  getTransactionsByLandId: getTransactionsByLandId,
  sellerApproved: sellerApproved,
  createTransaction: createTransaction,
  terminateTransaction: terminateTransaction,
};

export default transactionData;
