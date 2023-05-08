import { ObjectId } from "mongodb";
import validation from "../utils/validation.js";
import { getClient } from "../config/connection.js";
import { inputValidation } from "../utils/helpers.js";
import landData from "./land.js";
import userData from "./user.js";
import adminData from "./admin.js";
import entityData from "./entities.js";

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
      status: result[i].status,
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
      status: result[i].status,
    });
  }
  return data;
};

const getTransactionsByLandId = async (id) => {
  id = validation.validObjectId(id, "land Id");
  const client = getClient();
  const result = client
    .collection("transaction")
    .find({ land: new ObjectId(id) })
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

const sellerApproved = async (transactionId, sellerId, value, landId) => {
  //update will happen if and only if it is done by seller. Therefore, seller's ID is needed to authenticate.
  transactionId = validation.validObjectId(transactionId, "transactionId");
  sellerId = validation.validObjectId(sellerId, "sellersId");
  landId = validation.validObjectId(landId, "landId");

  //validate value field same as route validation

  const client = getClient();
  if (value === "approve") {
    const landSurveyorId = await entityData.assignEntity(
      transactionId,
      "land surveyor"
    );
    const titleCompanyId = await entityData.assignEntity(
      transactionId,
      "title company"
    );
    const governmentId = await entityData.assignEntity(
      transactionId,
      "government"
    );

    if (!landSurveyorId)
      throw "Could not find any Land Surveyor to assign to this transaction";
    if (!titleCompanyId)
      throw "Could not find any Title Company to assign to this transaction";
    if (!governmentId)
      throw "Could not find any Government user to assign to this transaction";

    let approvalupdates = {
      "seller.status": "approved",
      surveyor: {
        _id: new ObjectId(landSurveyorId),
        status: "pending",
        Comment: null,
      },
      titleCompanyId: {
        _id: new ObjectId(titleCompanyId),
        status: "pending",
        Comment: null,
      },
      government: {
        _id: new ObjectId(governmentId),
        status: "pending",
        Comment: null,
      },
      status: "pending",
    };

    let transactions = await transactionData.getTransactionsByLandId(landId);
    for (let i = 0; i < transactions.length; i++) {
      if (transactions[i].transactionId.toString() !== transactionId) {
        const result = await client.collection("transaction").findOneAndUpdate(
          {
            _id: new ObjectId(transactions[i].transactionId.toString()),
          },
          { $set: { status: "rejected" } },
          {}
        );
      }
    }

    const result = await client.collection("transaction").findOneAndUpdate(
      {
        _id: new ObjectId(transactionId),
        "seller._id": new ObjectId(sellerId),
      },
      { $set: { approvalupdates } },
      { returnDocument: "after" }
    );
    if (result.lastErrorObject.n < 1) {
      throw "Could not be approved";
    }
  } else if (value === "reject") {
    const result = await client.collection("transaction").findOneAndUpdate(
      {
        _id: new ObjectId(transactionId),
        "seller._id": new ObjectId(sellerId),
      },
      {
        $set: {
          "seller.status": "rejected",
          status: "rejected",
        },
      },
      { returnDocument: "after" }
    );
    if (result.lastErrorObject.n < 1) {
      throw "Could not be rejected";
    }
  }
  return;
};

const createTransaction = async (bid, landId, sellerId, buyerId) => {
  // Validating input
  bid = validation.validNumber(bid, "bid");
  landId = validation.validObjectId(landId);
  sellerId = validation.validObjectId(sellerId);
  buyerId = validation.validObjectId(buyerId);

  landData.getLand(landId);
  userData.getUserById(sellerId);
  userData.getUserById(buyerId);

  const adminId = await adminData.getAdminId();
  if (!adminId) throw "could not fetch admin accounts";

  let transaction = {
    land: new ObjectId(landId),
    buyer: {
      _id: new ObjectId(buyerId),
      bid: bid,
    },
    priceSoldFor: null,
    seller: {
      _id: new ObjectId(sellerId),
      status: "pending",
    },
    surveyor: {},
    titleCompany: {},
    government: {},
    admin: {
      _id: new ObjectId(adminId),
      status: false,
      Comment: null,
    },
    status: "pending",
  };

  const client = getClient();
  const insertedInfo = await client
    .collection("transaction")
    .insertOne(transaction);

  if (!insertedInfo.acknowledged || !insertedInfo.insertedId)
    throw "Could not initiate a transaction";

  const newTransaction = await getTransactionById(insertedInfo._id.toString());
  return newTransaction;
};

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

// This function is for admin usage
const getTransactionsForAccount = async (accountId) => {
  accountId = validation.validObjectId(accountId, 'accountId');

  const client = getClient();
  const result = await client
    .collection('transaction')
    .find(
      { $or: [
        { 'seller._id': new ObjectId(accountId) },
        { 'seller._id': new ObjectId(accountId) },
        { 'surveyor._id': new ObjectId(accountId) },
        { 'titleCompany._id': new ObjectId(accountId) },
        { 'government._id': new ObjectId(accountId) }
      ] }
    ).toArray();

  if (!result) throw 'Could not fetch transactions from the database';

  result = result.map((element) => {
    element._id = element._id.toString();
    element.seller._id = element.seller._id.toString();
    element.buyer._id = element.buyer._id.toString();
    if ('surveyor' in element && '_id' in element.surveyor && element.surveyor._id)
      element.surveyor._id = element.surveyor._id.toString();
    if ('titleCompany' in element && '_id' in element.titleCompany && element.titleCompany._id)
      element.titleCompany._id = element.titleCompany._id.toString();
    if ('government' in element && '_id' in element.government && element.government._id)
      element.government._id = element.government._id.toString();
    if ('admin' in element && '_id' in element.admin && element.admin._id)
      element.admin._id = element.admin._id.toString();
    return element;
  });

  return result;
}

const transactionData = {
  getTransactionsByBuyerId: getTransactionsByBuyerId,
  getTransactionsBySellerId: getTransactionsBySellerId,
  getTransactionsByLandId: getTransactionsByLandId,
  sellerApproved: sellerApproved,
  createTransaction: createTransaction,
  terminateTransaction: terminateTransaction,
  getTransactionById: getTransactionById,
  getTransactionsForAccount: getTransactionsForAccount
};

export default transactionData;
