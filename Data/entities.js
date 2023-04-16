import { ObjectId } from "mongodb";
import { getClient } from "../config/connection.js";

const getAllEntities = async () => {
  const client = getClient();
  const result = await client.collection("entities").find().toArray();
  return result;
};