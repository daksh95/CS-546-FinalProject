import { ObjectId } from "mongodb";
import { getClient } from "../config/connection.js";
import validation from "../Utils/validation.js";

const approveUser = async (userId) => {
  userId = validation.validObjectId(userId);
  
};

const approveLand = async (landId) => {};

const adminApproved = async (transactionId, buyerId, sellerId) => {};