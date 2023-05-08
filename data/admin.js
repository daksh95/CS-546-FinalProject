import { getClient } from "../config/connection.js";
import validation from "../utils/validation.js";
import userData from "./user.js";
import transactionData from "./transactions.js";
import landData from "./land.js";
import { ObjectId } from "mongodb";
import { getFullAddress } from "../utils/helpers.js";
import credentialData from './credential.js';

const getUnapprovedAccounts = async () => {
  const client = getClient();
  
  let unapprovedUsers = await client
    .collection('users')
    .find(
      { approved: 'pending' },
      { projection: { _id: 1, name: 1, emailId: 1 }}
    ).toArray();

  if (!unapprovedUsers) throw 'Not able to fetch unapproved users';
  unapprovedUsers = unapprovedUsers.map((user) => {
    user.role = 'User';
    return user;
  });

  let unapprovedEntities = await client
    .collection('entity')
    .find({ approved: 'pending' },
      { projection: { _id: 1, name: 1, emailId: 1, role: 1 }}
    ).toArray();

  let unapprovedCreds = await client
    .collection('credential')
    .find({
      isApproved: false,
      profileSetUpDone: true
    },
    { projection: { _id: 0, emailId: 1 } }
    ).toArray();

  unapprovedCreds = unapprovedCreds.map((cred) => cred.emailId);

  if (!unapprovedEntities) throw 'Not able to fetch unapproved entities';
  let unapprovedAccounts = [].concat(unapprovedUsers, unapprovedEntities);
  unapprovedAccounts = unapprovedAccounts.filter((account) => unapprovedCreds.includes(account.emailId));

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
      { _id: new ObjectId(accountId) }
    );

  const accountEntity = await client
    .collection('entity')
    .findOne(
      { _id: new ObjectId(accountId) }
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
      { approved: 'pending' },
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
      { 'surveyor.status': 'approved',
        'titleCompany.status': 'approved',
        'government.status': 'approved',
        'admin.status': 'pending'
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

const approveAccount = async (accountId, status, comment) => {
  accountId = validation.validObjectId(accountId, 'accountId');
  
  const client = getClient();
  const user = await client.collection('users').findOne({ _id: new ObjectId(accountId) });
  const entity = await client.collection('entity').findOne({ _id: new ObjectId(accountId) });

  if (!user && !entity) throw `Account not found for given Id`;

  const collectionName = user ? 'users' : 'entity';
  const account = user ? user : entity;

  status = validation.validString(status, 'Approval status');
  status = status.toLowerCase();
  if (!status === 'approved' || !status === 'rejected') throw 'Unable to update approval status'

  if (status === 'rejected') comment = validation.validString(comment, 'Approval comment')

  const result = await client
    .collection(collectionName)
    .findOneAndUpdate(
      { _id: new ObjectId(accountId) },
      { $set: {
        approved: status,
        approvalComment: comment
      } },
      { returnDocument: "after" }
    );

  if (result.lastErrorObject.n < 1) {
    throw `account status could not be updated`;
  }

  const credential = await credentialData.getCredentialByEmailId(account.emailId);

  const credUpdate = await client
    .collection('credential')
    .findOneAndUpdate(
      { _id: new ObjectId(credential._id) },
      { $set: { isApproved: true } },
      { returnDocument: "after" }
    );

  if (credUpdate.lastErrorObject.n < 1) {
    throw `account credential status could not be updated`;
  }

  return result;
};

const approveLand = async (landId, status, comment) => {
  landId = validation.validObjectId(landId, 'landId');
  const land = await landData.getLand(landId);

  status = validation.validString(status, 'Approval status');
  status = status.toLowerCase();
  if (!status === 'approved' || !status === 'rejected') throw 'Unable to update approval status'

  if (status === 'rejected') comment = validation.validString(comment, 'Approval comment')

  const client = getClient();
  const result = await client
    .collection("land")
    .findOneAndUpdate(
      { _id: new ObjectId(landId) },
      { $set: {
        approved: status,
        approvalComment: comment
      }},
      { returnDocument: "after" }
    );

  if (result.lastErrorObject.n < 1) {
    throw `land ${landId} could not be approved`;
  }

  return result;
  
};

const approveTransaction = async (transactionId, status, comment) => {
  transactionId = validation.validObjectId(transactionId, 'transactionId');
  const transaction = await transactionData.getTransactionById(transactionId);

  const buyerId = transaction.buyer._id.toString();
  const sellerId = transaction.seller._id.toString();
  const landId = transaction._id.toString();

  status = validation.validString(status, 'Approval status');
  status = status.toLowerCase();
  if (!status === 'approved' || !status === 'rejected') throw 'Unable to update approval status';

  if (status === 'rejected') comment = validation.validString(comment, 'Approval comment');

  const client = getClient();
  const transactionApproval = await client
    .collection('transaction')
    .findOneAndUpdate(
      { _id: new ObjectId(transactionId) },
      { $set: {
        approval: status,
        "admin.status": true,
        "admin.Comment": comment
      }},
      { returnDocument: "after" }
    );
  
  if (transactionApproval.lastErrorObject.n < 1) {
    throw `transaction ${transactionId} could not be approved`;
  }

  if (status === 'approved') {
    try {
      await userData.addLandToUser(sellerId, landId);
      await userData.removeLandFromUser(buyerId, landId);
    } catch (error) {
      throw 'Ownership could not be transferred';
    }
  }

  return result;
};

const getAdminId = async () => {
  const client = getClient();
  const result = await client.collection('credential').findOne({ typeOfUser: 'admin' });
  if (!result) throw 'No admin account exists, please make one';

  result._id = result._id.toString();
  return result._id;
}

const adminData = {
  approveAccount,
  approveLand,
  approveTransaction,
  getUnapprovedAccounts,
  getAccountById,
  getUnapprovedLands,
  getUnapprovedTransactions,
  getAdminId
};

export default adminData;