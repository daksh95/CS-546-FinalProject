import landData from "../data/land.js";
import userData from "../data/user.js";
import transactionData from "../data/transactions.js";
import {
  checkInputType,
  exists,
  validStateCodes,
  inputValidation,
} from "../utils/helpers.js";
import { ObjectId } from "mongodb";

const getLand = async (req, res) => {
  let id = req.params.id;
  let error = [];
  if (!exists(id)) error.push("ID parameter does not exists");
  if (!checkInputType(id, "string"))
    error.push("ID must be of type string only");
  if (id.trim().length === 0) error.push("ID cannot be of empty spaces");
  id = id.trim();
  if (!ObjectId.isValid(id)) error.push("Invalid Object ID");
  if (error.length !== 0)
    return res.status(400).render("Error", {
      title: "Error",
      hasError: true,
      error: error,
    });
  let isOwner = false;
  let owner = undefined;
  try {
    owner = await userData.getOwnerByLandId(id);
    isOwner = true;
  } catch (error) {
    isOwner = false;
  }
  let pendingTransaction = false;
  try {
    //check if transaction is already there between buyer and seller for this land (waiting for user id)
  } catch (error) {
    //
  }
  try {
    const land = await landData.getLand(id);
    res.status(200).render("displayLandDetails", {
      title: "Land Details",
      land: land,
      owner: owner,
      isOwner: isOwner,
    });
  } catch (error) {
    res.status(404).render("Error", {
      title: "Error",
      hasError: true,
      error: [error.message],
    });
  }
  // res.status(200).json({ data: result });/
};
const getAllLand = async (req, res) => {
  const result = await landData.getAllLand();
  res.status(200).json(result);
};

const getLandByState = async (req, res) => {
  try {
    let lands = await landData.getAllLand();
    res.status(200).render("displayLandByState", {
      title: "Lands",
      landByState: lands,
      state: undefined,
    });
  } catch (error) {
    res.status(404).redner("Error", {
      title: "Error",
      hasError: true,
      error: [error.message],
    });
  }
};

const postLandByState = async (req, res) => {
  let state = req.body.stateInput;
  let error = [];
  if (!exists(state)) error.push("State is not entered");
  if (!checkInputType(state, "string"))
    error.push("State must be of type string only");
  if (state.trim().length === 0)
    error.push("State cannot contain empty spaces only");
  state = state.trim();
  if (!validStateCodes.includes(state.toUpperCase()))
    error.push(
      "State parameter must be a valid statecode in abbreviations only"
    );
  if (error.length !== 0)
    return res.status(400).render("displayLandByState", {
      title: "Lands",
      landByState: [],
      state: undefined,
      hasSearchError: true,
      error: error,
    });

  try {
    let landByState = await landData.getLandByState(state);
    res.status(200).render("displayLandByState", {
      title: "Lands",
      landByState: landByState,
      state: state,
    });
  } catch (error) {
    return res.status(400).render("displayLandByState", {
      title: "Lands",
      landByState: [],
      state: undefined,
      hasSearchError: true,
      error: [error.message],
    });
  }
};

const postFilterPrice = async (req, res) => {
  let state = req.params.state;
  let minPrice = parseInt(req.body.minPriceInput);
  let maxPrice = parseInt(req.body.maxPriceInput);
  let errors = [];
  try {
    state = inputValidation("state", state, "string").trim();
  } catch (error) {
    errors.push(error.message);
  }
  try {
    minPrice = inputValidation("minPrice", minPrice, "number");
  } catch (error) {
    errors.push(error.message);
  }
  try {
    maxPrice = inputValidation("maxPrice", maxPrice, "number");
  } catch (error) {
    errors.push(error.message);
  }
  if (!validStateCodes.includes(state.toUpperCase()))
    errors.push(
      "State parameter must be a valid statecode in abbreviations only"
    );
  if (maxPrice < minPrice) errors.push("maxPrice cannot be less than minPrice");
  if (errors.length !== 0)
    return res.status(400).render("displayLandByState", {
      title: "Lands",
      landByState: [],
      state: state,
      hasError: true,
      error: errors,
    });

  try {
    let filteredLands = await landData.filterByPrice(state, minPrice, maxPrice);
    return res.status(200).render("displayLandByState", {
      title: "Lands",
      landByState: filteredLands,
      state: state,
    });
  } catch (error) {
    return res.status(400).render("displayLandByState", {
      title: "Lands",
      landByState: [],
      state: state,
      hasError: true,
      error: [error.message],
    });
  }
};

const postFilterArea = async (req, res) => {
  let state = req.params.state;
  let minArea = req.body.minAreaInput;
  let maxArea = req.body.maxAreaInput;
  let errors = [];
  try {
    state = inputValidation("state", state, "string").trim();
  } catch (error) {
    errors.push(error.message);
  }
  try {
    minArea = inputValidation("minArea", minArea, "string").trim();
  } catch (error) {
    errors.push(error.message);
  }
  try {
    maxArea = inputValidation("maxArea", maxArea, "string").trim();
  } catch (error) {
    errors.push(error.message);
  }
  if (!validStateCodes.includes(state.toUpperCase()))
    errors.push(
      "State parameter must be a valid statecode in abbreviations only"
    );
  if (Number(maxArea) < Number(minArea))
    errors.push("maxArea cannot be less than minArea");
  if (errors.length !== 0)
    return res.status(400).render("displayLandByState", {
      title: "Lands",
      landByState: [],
      state: state,
      hasError: true,
      error: errors,
    });

  try {
    let filteredLands = await landData.filterByArea(state, minArea, maxArea);
    return res.status(200).render("displayLandByState", {
      title: "Lands",
      landByState: filteredLands,
      state: state,
    });
  } catch (error) {
    return res.status(400).render("displayLandByState", {
      title: "Lands",
      landByState: [],
      state: state,
      hasError: true,
      error: [error.message],
    });
  }
};

const placedBid = async (req, res) => {
  let bid = req.body.bidInput;
  let landId = req.params.landId;
  let sellerId = req.params.sellerId;
  let landPrice = req.body.price;
  let error = [];
  if (!exists(bid)) error.push("bid parameter does not exists");
  if (!checkInputType(bid, "number") || bid === NaN || bid === Infinity)
    error.push("bid must be of type number only");
  if (!Number.isInteger(bid)) error.push("bid cannot be in decimal place");
  if (bid < landPrice - 1000)
    error.push("Difference between bid and price cannot be more than $1000");
  if (!exists(sellerId)) error.push("sellerId parameter does not exists");
  if (!checkInputType(sellerId, "string"))
    error.push("sellerId must be of type string only");
  if (sellerId.trim().length === 0)
    error.push("sellerId cannot be of empty spaces");
  sellerId = sellerId.trim();
  if (!ObjectId.isValid(sellerId)) error.push("Invalid Object sellerId");
  if (!exists(landId)) error.push("landId parameter does not exists");
  if (!checkInputType(landId, "string"))
    error.push("landId must be of type string only");
  if (landId.trim().length === 0)
    error.push("landId cannot be of empty spaces");
  landId = landId.trim();
  if (!ObjectId.isValid(landId)) error.push("Invalid Object landId");
  if (error.length !== 0)
    return res.status(400).render("Error", {
      title: "Error",
      hasError: true,
      error: error,
    });
  try {
    await transactionData.createTransaction(bid, landId, sellerId);
    return res.status(200).redirect("/land/" + landId);
  } catch (error) {
    return res.status(400).render("Error", {
      title: "Error",
      hasError: true,
      error: [error.message],
    });
  }
};

const updateLand = async (req, res) => {};

const postLand = async (req, res) => {};

const removeLand = async (id) => {};

export {
  getAllLand,
  getLand,
  updateLand,
  postLand,
  removeLand,
  getLandByState,
  postLandByState,
  postFilterArea,
  postFilterPrice,
  placedBid,
};
