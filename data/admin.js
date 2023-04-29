import { getClient } from "../config/connection.js";
import validation from "../utils/validation.js";
import userData from "./user.js";
import transactionData from "./transactions.js";
import landData from "./land.js";
import { ObjectId } from "mongodb";

const getUnapprovedAccounts = async () => {
  const client = getClient();
  
  const unapprovedUsers = await client
    .collection('users')
    .find(
      { approved: false },
      { projection: { _id: 1, name: 1, emailId: 1 }}
    ).toArray();

  if (!unapprovedUsers) throw 'Not able to fetch unapproved users';
  unapprovedUsers = unapprovedUsers.map((user) => user.type = 'User');

  const unapprovedEntities = await client
    .collection('entities')
    .find({ approved: false },
      { projection: { _id: 1, name: 1, emailId: 1, type: 1 }}
    ).toArray();
  
  const unapprovedAccounts = [].concat(unapprovedUsers, unapprovedEntities);
  unapprovedAccounts = unapprovedAccounts.map((account) => account._id = account._id.toString());

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
  account._id = account._id.toString();

  return account;
};

const getUnapprovedLands = async () => {
  const client = getClient();

  const unapprovedLands = await client
    .collection('land')
    .find(
      { approved: false },
    ).toArray();

  unapprovedLands = unapprovedLands.map((land) => land._id = land._id.toString());
  
  return unapprovedLands;
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

const adminData = {
  approveUser,
  approveLand,
  adminApproved,
  getUnapprovedAccounts,
  getAccountById
};

export default adminData;