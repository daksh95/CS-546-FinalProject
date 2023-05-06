import { getClient } from "../config/connection.js";
import validation from "../utils/validation.js";
import userData from "./user.js";
import transactionData from "./transactions.js";
import landData from "./land.js";
import { ObjectId } from "mongodb";
import { getFullAddress } from "../utils/helpers.js";

const getUnapprovedAccounts = async () => {
  const client = getClient();
  
  let unapprovedUsers = await client
    .collection('users')
    .find(
      { approved: false },
      { projection: { _id: 1, name: 1, emailId: 1 }}
    ).toArray();

  if (!unapprovedUsers) throw 'Not able to fetch unapproved users';
  unapprovedUsers = unapprovedUsers.map((user) => {
    user.role = 'User';
    return user;
  });

  let unapprovedEntities = await client
    .collection('entity')
    .find({ approved: false },
      { projection: { _id: 1, name: 1, emailId: 1, role: 1 }}
    ).toArray();

  if (!unapprovedEntities) throw 'Not able to fetch unapproved entities';
  let unapprovedAccounts = [].concat(unapprovedUsers, unapprovedEntities);

  unapprovedAccounts = unapprovedAccounts.map((account) => {
    account._id = account._id.toString();
    return account;
  });

  return unapprovedAccounts;
};

const getAccountById = async (accountId) => {
  const client = getClient();

  const accountUser = await client
    .collection('users')
    .findOne(
      { _id: ObjectId(accountId) }
    );

  const accountEntity = await client
    .collection('entities')
    .findOne(
      { _id: ObjectId(accountId) }
    );

  if (!accountUser && !accountEntity) throw 'No account found for the given ID';

  const account = accountUser ? accountUser : accountEntity;
  
  if (accountUser) account.role = 'User';

  account._id = account._id.toString();

  return account;
};

const getUnapprovedLands = async () => {
  const client = getClient();

  let unapprovedLands = await client
    .collection('land')
    .find(
      { approved: false },
    ).toArray();

  if (!unapprovedLands) throw 'Unable to fetch unapproved lands';
  
  unapprovedLands = unapprovedLands.map((land) => {
    land._id = land._id.toString();
    land.address.fullAddress = getFullAddress(land.address);
    return land;
  });
  
  return unapprovedLands;
}

const getUnapprovedTransactions = async () => {
  const client = getClient();

  let unapprovedTransactions = await client
    .collection('transaction')
    .find (
      { 'surveyor.status': true,
        'titleCompany.status': true,
        'government.status': true,
        'admin.status': false
      }
    ).toArray();

  if (!unapprovedTransactions) throw 'Unable to fetch unapproved transactions';

  unapprovedTransactions = unapprovedTransactions.map((transaction) => {
    transaction._id = transaction._id.toString()
    return transaction;
  } 
  );

  return unapprovedTransactions;
}

const approveUser = async (userId) => {
  userId = validation.validObjectId(userId);
  const user = await userData.getUserById(userId);
  
  const client = getClient();
  const result = await client
    .collection("users")
    .findOneAndUpdate(
      { _id: userId },
      { $set: { approved: true } },
      { returnDocument: "after" }
    );

  if (result.lastErrorObject.n < 1) {
    throw `user ${userId} could not be approved`;
  }

  return result;
};

const approveLand = async (landId) => {
  landId = validation.validObjectId(landId);
  const land = await landData.getLand(landId);

  const client = getClient();
  const result = await client
    .collection("land")
    .findOneAndUpdate(
      { _id: landId },
      { $set: { approved: true }},
      { returnDocument: "after" }
    );

  if (result.lastErrorObject.n < 1) {
    throw `land ${landId} could not be approved`;
  }

  return result;
  
};

const adminApproved = async (transactionId, buyerId, sellerId) => {};

const getAdminId = async () => {
  const client = getClient();
  const result = await client.collection('credential').findOne({ typeOfUser: 'admin' });
  if (!result) throw 'No admin account exists, please make one';

  result._id = result._id.toString();
  return result._id;
}

const adminData = {
  approveUser,
  approveLand,
  adminApproved,
  getUnapprovedAccounts,
  getAccountById,
  getUnapprovedLands,
  getUnapprovedTransactions,
  getAdminId
};

export default adminData;