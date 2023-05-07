import { ObjectId } from "mongodb";
import { getClient } from "../config/connection.js";
import validation from "../utils/validation.js";
import {
  exists,
  checkInputType,
  validStateCodes,
  arrayLength,
  inputValidation,
} from "../utils/helpers.js";

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

const addNewLand = async (object) => {
  let { dimensions, type, restrictions, sale, address, approved } = object;
  const queryData = {};
  let length = parseInt(dimensions.length);
  let breadth = parseInt(dimensions.breadth);
  
  //valid numbers
  length = validation.validNumber(
    dimensions.length,
    "length",
    1
  );

  breadth = validation.validNumber(
    dimensions.breadth,
    "breadth",
    1
  );

  queryData.dimensions ={
    length:length,
    breadth:breadth
  }
  //default behaviour
  queryData.sale = {
    price: 1,
    dateOfListing:"11/11/1234",
    onSale: false,
  }
 
  //valid string and string of array
  queryData.type = validation.validString(type, "type of land", 20);
  queryData.restrictions = validation.validArrayOfStrings(
    restrictions,
    "restrictions"
  );

  queryData.area = (dimensions.length*dimensions.breadth).toString();
  
  address.line1 = validation.validString(address.line1, "line1", 46);
  address.line2 = validation.validString(address.line2, "line2", 46);
  address.city = validation.validString(address.city, "city", 17);
  address.state = validation.validString(address.state, "state", 2);
  address.zipCode = validation.validString(
    address.zipCode,
    "zipCode",
    501,
    99950
  );

  queryData.address = {
    line1:address.line1,
    line2:address.line2,
    city: address.city,
    state:address.state,
    zipCode:address.zipCode
  }

  //valid status
  queryData.approved = validation.validApprovalStatus(approved, "approved");

  //fetch db reference
  const client = getClient();

  //inserting new land
  let result = await client.collection("land").insertOne(queryData);

  //error handling incase Insertion doesn't happen
  if (!result.acknowledged || !result.insertedId) throw "Could not add land";

  //returning newly added land
  const addedLand = await getLand(result.insertedId.toString());
  return addedLand;
};

const updateLand = async (object) => {
  let { dimensions, type, restrictions, sale, address, approved, landId } = object;
  const queryData = {};
  
  //valid numbers
  queryData.dimensions.length = validation.validNumber(
    dimensions.length,
    "length",
    1
  );
  queryData.dimensions.breadth = validation.validNumber(
    dimensions.breadth,
    "breadth",
    1
  );
  queryData.sale.price = validation.validNumber(sale.price, "price", (min = 1));
  queryData.address.zipCode = validation.validString(
    address.zipCode,
    "zipCode",
    501,
    99950
  );

  //valid string and string of array
  queryData.type = validation.validString(type, "type of land", 20);
  queryData.restrictions = validation.validArrayOfStrings(
    restrictions,
    "restrictions"
  );
  queryData.sale.dateOfListing = validation.validString(
    sale.dateOfListing,
    "dateOfListing",
    10
  );
  queryData.area = (dimensions.length*dimensions.breadth).toString();
  queryData.address.line1 = validation.validString(address.line1, "line1", 46);
  queryData.address.line2 = validation.validString(address.line2, "line2", 46);
  queryData.address.city = validation.validString(address.city, "city", 17);
  queryData.address.state = validation.validString(address.state, "state", 2);

  //valid bool
  queryData.sale.onSale = validation.validBool(sale.onSale, "onSale");
  queryData.approved = validation.validApprovalStatus(approved, "approved");

  //fetch db reference
  const client = getClient();

  //inserting new land
  let result = await client.collection("land").findOneAndUpdate({id:landId},queryData, {});

  //error handling incase Insertion doesn't happen
  if (!result.acknowledged || !result.insertedId) throw "Could not update land"; //TODO check this functionality;

  //returning newly added land
  return result;
};

const removeLand = async (id) => {
  if (!exists(id)) throw new Error("ID parameter does not exists");
  if (!checkInputType(id, "string"))
    throw new Error("ID must be of string only");
  if (id.trim().length === 0) throw new Error("ID cannot be of empty spaces");
  id = id.trim();
  if (!ObjectId.isValid(id)) throw new Error("Invalid Object ID");
  const client = getClient();
  const result = await client.collection("land").findOneAndDelete({
    _id: new ObjectId(id),
  });
  if (result.lastErrorObject.n === 0)
    throw new Error("Could not delete land with that id");
  return `${result.value.name} has been successfully deleted`;
};

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
  const regexState = new RegExp(state, "i");
  const client = getClient();
  const result = await client
    .collection("land")
    .find({ "address.state": { $regex: regexState } })
    .toArray();
  return result;
};

const filterByArea = async (state, minArea, maxArea) => {
  try {
    state = inputValidation("state", state, "string").trim();
  } catch (error) {
    throw new Error(error.message);
  }
  try {
    minArea = inputValidation("minArea", minArea, "string").trim();
  } catch (error) {
    throw new Error(error.message);
  }
  try {
    maxArea = inputValidation("maxArea", maxArea, "string").trim();
  } catch (error) {
    throw new Error(error.message);
  }
  if (!validStateCodes.includes(state.toUpperCase()))
    throw new Error(
      "State parameter must be a valid statecode in abbreviations only"
    );
  if (Number(maxArea) < Number(minArea))
    throw new Error("maxArea cannot be less than minArea");
  const regexState = new RegExp(state, "i");
  const client = getClient();
  const result = await client
    .collection("land")
    .find({
      $and: [
        { "address.state": { $regex: regexState } },
        { area: { $gte: minArea, $lte: maxArea } },
      ],
    })
    .toArray();
  return result;
};

const filterByPrice = async (state, minPrice, maxPrice) => {
  try {
    state = inputValidation("state", state, "string").trim();
  } catch (error) {
    throw new Error(error.message);
  }
  try {
    minPrice = inputValidation("minPrice", minPrice, "number");
  } catch (error) {
    throw new Error(error.message);
  }
  try {
    maxPrice = inputValidation("maxPrice", maxPrice, "number");
  } catch (error) {
    throw new Error(error.message);
  }
  if (!validStateCodes.includes(state.toUpperCase()))
    throw new Error(
      "State parameter must be a valid statecode in abbreviations only"
    );
  if (maxPrice < minPrice)
    throw new Error("maxPrice cannot be less than minPrice");
  const regexState = new RegExp(state, "i");
  const client = getClient();
  const result = await client
    .collection("land")
    .find({
      $and: [
        { "address.state": { $regex: regexState } },
        { "sale.price": { $gte: minPrice, $lte: maxPrice } },
      ],
    })
    .toArray();
  return result;
};

const landData = {
  getAllLand: getAllLand,
  getLand: getLand,
  updateLand: updateLand,
  removeLand: removeLand,
  getLandByState: getLandByState,
  filterByArea: filterByArea,
  filterByPrice: filterByPrice,
  addNewLand: addNewLand,
};

export default landData;
