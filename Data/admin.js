import { getClient } from "../config/connection.js";
import validation from "../Utils/validation.js";
import userData from "./user.js";
import transactionData from "./transactions.js";
import landData from "./land.js";

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
  approveUser: approveUser,
  approveLand: approveLand,
  adminApproved: adminApproved
};

export default adminData;