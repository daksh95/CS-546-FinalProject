import { ObjectId } from "mongodb";
import { getClient } from "../config/connection.js";
import validation from "../Utils/validation.js";
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

const addNewLand = async(object)=>{
    let {dimensions, type, restrictions, sale,address, price, approved } = object;
    const queryData={};
    
    //valid numbers
    queryData.length = validation.validNumber(dimensions.length, "length");
    queryData.breadth = validation.validNumber(dimensions.breadth, "breadth");
    queryData.price = validation.validNumber(price, "price");
   
    //valid string and string of array
    queryData.type = validation.validString(type, "type of land");
    queryData.address = validation.validString(address, "address");
    queryData.restrictions = validation.validArrayOfStrings(restrictions, "restrictions");

    //valid bool
    queryData.sale = validation.validBool(sale, "sale");
    queryData.approved = validation.validBool(approved, "approved");

    //fetch db reference
    const client = getClient();
    
    //inserting new land
    let result = await client.insertOne(queryData);

    //error handling incase Insertion doesn't happen
    if (!result.acknowledged || !result.insertedId) throw 'Could not add land';
    
    //returning newly added land
    const addedLand = await getLand(result.insertedId.toString());
    return addedLand;
  } 

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

const filterByArea = async (state, minArea, maxArea) => {
  try {
    state = inputValidation(state, "string").trim();
  } catch (error) {
    throw new Error(error.message);
  }
  try {
    minArea = inputValidation(minArea, "string").trim();
  } catch (error) {
    throw new Error(error.message);
  }
  try {
    maxArea = inputValidation(maxArea, "string").trim();
  } catch (error) {
    throw new Error(error.message);
  }
  if (!validStateCodes.includes(state.toUpperCase()))
    throw new Error(
      "State parameter must be a valid statecode in abbreviations only"
    );
  const client = getClient();
  const result = await client
    .collection("land")
    .find({
      $and: [{ state: state }, { area: { $gte: minArea, $lte: maxArea } }],
    })
    .toArray();
  return result;
};

const filterByPrice = async (state, minPrice, maxPrice) => {
  try {
    state = inputValidation(state, "string").trim();
  } catch (error) {
    throw new Error(error.message);
  }
  try {
    minPrice = inputValidation(minPrice, "number");
  } catch (error) {
    throw new Error(error.message);
  }
  try {
    maxPrice = inputValidation(maxPrice, "number");
  } catch (error) {
    throw new Error(error.message);
  }
  if (!validStateCodes.includes(state.toUpperCase()))
    throw new Error(
      "State parameter must be a valid statecode in abbreviations only"
    );
  const client = getClient()
  const result = await client
  .collection("land")
  .find({
    $and: [{ state: state }, { price: { $gte: minPrice, $lte: maxPrice } }],
  })
  .toArray();
return result;
};

const landData = {
  getAllLand: getAllLand,
  getLand: getLand,
  updateLand:updateLand,
  postLand: postLand,
  removeLand: removeLand,
  getLandByState: getLandByState,
  filterByArea: filterByArea,
  filterByPrice: filterByPrice
};

export default landData;
