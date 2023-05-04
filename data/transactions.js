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
    .find({ "buyer._id": new ObjectId(id) })
    .toArray();
  //get land by Id,
  //get status;
  let data = [];
  for (let i = 0; i < result.length; i++) {
    data.push({
      transactionId: result[i]._id,
      landId: result[i].landId,
      status: result[i].buyer.status,
    });
  }

  return data;
};

const getTransactionsBySellerId = async (id) => {
  id = validation.validObjectId(id, "Seller Id");
  const client = getClient();
  const result = client
    .collection("transaction")
    .find({ "seller._id": new ObjectId(id) })
    .toArray();
  //get land by Id,
  //get status;
  let data = [];
  for (let i = 0; i < result.length; i++) {
    data.push({
      transactionId: result[i]._id,
      landId: result[i].landId,
      status: result[i].seller.status
    });
  }
  return data;
};

const getTransactionsByLandId = async (id) => {
  id = validation.validObjectId(id, "land Id");
  const client = getClient();
  const result = client
    .collection("transaction")
    .find({ landId: new ObjectId(id) })
    .toArray();
  if (result.length < 1) {
    throw "No transaction from that ID";
  }
  let data = [];
  for (let i = 0; i < result.length; i++) {
    // Get users by ID.
    const { name: buyerName } = await userData.getUserById(
      result[i].buyer._id.toString()
    );
    data.push({
      transactionId: result[i]._id,
      buyerId: result[i].buyer._id.toString(),
      buyer: buyerName,
      bid: result[i].buyer.bid,
      status: result[i].status,
    });
    //
  }
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

const createTransaction = async (bid, landId, sellerId) => {};

const terminateTransaction = async (transactionId, adminComment) => {
  transactionId = validation.validObjectId(transactionId, "transactionId");
  const client = getClient();
  const result = await client.collection("transaction").findOneAndUpdate(
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

const getTransactionById = async (transactionId) => {
  transactionId = validation.validObjectId(transactionId, "transactionId");

  const client = getClient();
  const result = await client
    .collection("transaction")
    .findOne({ _id: new ObjectId(transactionId) });

  if (!result)
    throw `No transaction found for the given transactionId: ${transactionId}`;

  result._id = result._id.toString();
  return result;
};

const transactionData = {
  getTransactionsByBuyerId: getTransactionsByBuyerId,
  getTransactionsBySellerId: getTransactionsBySellerId,
  getTransactionsByLandId: getTransactionsByLandId,
  sellerApproved: sellerApproved,
  createTransaction: createTransaction,
  terminateTransaction: terminateTransaction,
  getTransactionById: getTransactionById,
};

export default transactionData;
