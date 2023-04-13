import { ObjectId } from "mongodb";
import { getClient } from "../config/connection.js";
import {
  exists,
  checkInputType,
  validStateCodes,
  arrayLength,
  inputValidation,
} from "../Utils/helpers.js";

const getLand = async (id) => {
  if (!exists(id)) throw new Error("ID parameter does not exists");
  if (!checkInputType(id, "string"))
    throw new Error("ID must be of string only");
  if (id.trim().length === 0) throw new Error("ID cannot be of empty spaces");
  id = id.trim();
  if (!ObjectId.isValid(id)) throw new Error("Invalid Object ID");
  const client = getClient();
  const result = await client
    .collection("land")
    .findOne({ _id: new ObjectId(id) });
  if (result === null) throw new Error("No Land with such ID");
  result._id = result._id.toString();
  return result;
};

const getAllLand = async () => {
  const client = getClient();
  const result = await client.collection("land").find().toArray();
  return result;
};

const updateLand = async (object) => {};

const postLand = async (object) => {};

const removeLand = async (id) => {};

const getLandByState = async (state) => {
  if (!exists(state)) throw new Error("State parameter does not exists");
  if (!checkInputType(state, "string"))
    throw new Error("State parameter must be of type string");
  if (state.trim().length === 0)
    throw new Error("State cannot contain empty spaces only");
  state = state.trim();
  if (!validStateCodes.includes(state.toUpperCase()))
    throw new Error(
      "State parameter must be a valid statecode in abbreviations only"
    );
  const client = getClient();
  const result = await client
    .collection("land")
    .find({ state: state })
    .toArray();
  return result;
};

const filterByArea = async (state, area) => {
  try {
    state = inputValidation(state, "string");
  } catch (error) {
    throw new Error(error.message);
  }
  try {
    area = inputValidation(area, "string");
  } catch (error) {
    throw new Error(error.message);
  }
  if (!validStateCodes.includes(state.toUpperCase()))
    throw new Error(
      "State parameter must be a valid statecode in abbreviations only"
    );
};

const landData = {
  getAllLand: getAllLand,
  getLand: getLand,
  updateLand,
  updateLand,
  postLand: postLand,
  removeLand: removeLand,
  getLandByState: getLandByState,
};

export default landData;
