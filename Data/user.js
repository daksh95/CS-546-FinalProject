import validation from "../Utils/validation.js";
import { getClient } from "../config/connection.js";
import { checkInputType, exists } from "../Utils/helpers.js";
import { ObjectId } from "mongodb";

const getOwnerByLandId = async (landID) => {
   if (!exists(id)) throw new Error("ID parameter does not exist");
   if (!checkInputType(id, "string"))
     throw new Error("ID must be of type string only");
   if (id.trim().length === 0)
     throw new Error("ID cannot contain empty spaces only");
   id = id.trim();
   if (!ObjectId.isValid(id)) throw new Error("Invalid object id"); 
};

const getUserByEmail = async (email) => {
  email = validation.validEmail(email);
  const client = getClient();
  const result = await client.collection("users").findOne({ emailId: email });
  return result;
};

const updateUserData = async (email) => {};

const getUserById = async (id) => {
  if (!exists(id)) throw new Error("ID parameter does not exist");
  if (!checkInputType(id, "string"))
    throw new Error("ID must be of type string only");
  if (id.trim().length === 0)
    throw new Error("ID cannot contain empty spaces only");
  id = id.trim();
  if (!ObjectId.isValid(id)) throw new Error("Invalid object id");
  const client = getClient();
  const result = await client
    .collection("users")
    .findOne({ _id: new ObjectId(id) });
  if (result === null) throw new Error("No user found with such ID");
  result._id = result._id.toString();
  return result;
};
