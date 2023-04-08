import { getClient } from "../config/connection.js";
import { exists, checkInputType } from "../Utils/helpers.js";
const getLand = async (id) => {};
const getAllLand = async () => {
  const client = getClient();
  const result = await client.collection("land").find().toArray();
  return result;
};

const updateLand = async (object) => {};

const postLand = async (object) => {};

const removeLand = async (id) => {};

const getLandByState = async (state) => {
  const client = getClient();
  const result = await client
    .collection("land")
    .find({ state: state })
    .toArray();
  return result;
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
