import { ObjectId } from "mongodb";
import { getClient } from "../config/connection.js";
import validation from "../utils/validation.js";
import moment from "moment";
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
  length = validation.validNumber(dimensions.length, "length", 1);

  breadth = validation.validNumber(dimensions.breadth, "breadth", 1);

  queryData.dimensions = {
    length: length,
    breadth: breadth,
  };
  //default behaviour
  queryData.sale = {
    price: undefined,
    dateOfListing: undefined,
    onSale: false,
  };

  //valid string and string of array
  queryData.type = validation.validLandType(type);
  queryData.restrictions = validation.validArrayOfStrings(
    restrictions,
    "restrictions"
  );

  queryData.area = (dimensions.length * dimensions.breadth);

  address.line1 = validation.validString(address.line1, "line1", 46);
  address.line2 = address.line2.trim();
  if (address.line2.length > 46) {
    throw "line2 shouldn't be longer that 46 characters";
  }
  address.city = validation.validString(address.city, "city", 17);
  address.state = validation.validState(address.state);
  address.zipCode = validation.validZip(
    address.zipCode,
    address.state,
    address.city
  );

  queryData.address = {
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    zipCode: address.zipCode,
  };

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
    minArea = inputValidation("minArea", minArea, "number");
  } catch (error) {
    throw new Error(error.message);
  }
  try {
    maxArea = inputValidation("maxArea", maxArea, "number");
  } catch (error) {
    throw new Error(error.message);
  }
  if (!validStateCodes.includes(state.toUpperCase()))
    throw new Error(
      "State parameter must be a valid statecode in abbreviations only"
    );
  if ((maxArea) < (minArea))
    throw new Error("maxArea cannot be less than minArea");
  const regexState = new RegExp(state, "i");
  const client = getClient();
  const result = await client
    .collection("land")
    .find({
      "address.state": { $regex: regexState },
      area: { $gte: minArea, $lte: maxArea },
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

const putOnSale = async (landId, price) => {
  if (!exists(landId)) throw new Error("ID parameter does not exists");
  if (!checkInputType(landId, "string"))
    throw new Error("ID must be of type string only");
  if (landId.trim().length === 0)
    throw new Error("ID cannot be of empty spaces");
  landId = landId.trim();
  if (!ObjectId.isValid(landId)) throw new Error("Invalid Object ID");
  if (!exists(price)) throw new Error("Price parameter does not exists");
  if (!checkInputType(price, "number") || price === NaN || price === Infinity)
    throw new Error("Price must be of type number only");

  let date = moment();
  const client = getClient();
  const result = client.collection("land").findOneAndUpdate(
    {
      _id: new ObjectId(landId),
    },
    {
      $set: {
        "sale.onSale": true,
        "sale.price": price,
        "sale.dateOfListing": date.format("MM/DD/YYYY"),
      },
    },
    {}
  );
  return;
};

const landData = {
  getAllLand: getAllLand,
  getLand: getLand,
  removeLand: removeLand,
  getLandByState: getLandByState,
  filterByArea: filterByArea,
  filterByPrice: filterByPrice,
  addNewLand: addNewLand,
  putOnSale: putOnSale,
};

export default landData;
