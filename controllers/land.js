import landData from "../data/land.js";
import userData from "../data/user.js";
import transactionData from "../data/transactions.js";
import {
  checkInputType,
  exists,
  validStateCodes,
  inputValidation,
  arrayLength,
} from "../utils/helpers.js";
import { ObjectId } from "mongodb";
import validation from "../utils/validation.js";

const getLand = async (req, res) => {
  // console.log("here");
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
    if (owner._id === req.session.user.id) isOwner = true;
  } catch (error) {
    isOwner = false;
  }
  let pendingTransaction = false;
  try {
    const buyerId = req.session.user.id;
    let transactions = await transactionData.getTransactionsByLandId(id);
    for (let i = 0; i < transactions.length; i++) {
      if (
        transactions[i].buyerId === buyerId &&
        transactions[i].status === "pending"
      )
        pendingTransaction = true;
    }
  } catch (error) {
    pendingTransaction = false;
  }
  try {
    const land = await landData.getLand(id);
    res.status(200).render("displayLandDetails", {
      title: "Land Details",
      land: land,
      owner: owner,
      isOwner: isOwner,
      pendingTransaction: pendingTransaction,
      userId: req.session.user.id,
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

const getLandByState = async (req, res) => {
  try {
    let lands = await landData.getAllLand();
    let empty_lands = false;
    if (!arrayLength(lands, 1)) empty_lands = true;
    res.status(200).render("displayLandByState", {
      title: "Lands",
      landByState: lands,
      state: undefined,
      empty_lands: empty_lands,
      userId: req.session.user.id,
    });
  } catch (error) {
    res.status(404).render("Error", {
      title: "Error",
      hasError: true,
      error: [error.message],
    });
  }
};

const postLandByState = async (req, res) => {
  let state = req.body.state;
  if (!exists(state))
    return res.status(400).send({ message: "State not provided" });
  if (!checkInputType(state, "string"))
    return res
      .status(400)
      .send({ message: "State must be of type string only" });
  if (state.trim().length === 0)
    return res
      .status(400)
      .send({ message: "State cannot contain empty spaces only" });
  state = state.trim();
  if (!validStateCodes.includes(state.toUpperCase()))
    return res.status(400).send({
      message:
        "State parameter must be a valid statecode in abbreviations only",
    });

  try {
    let landByState = await landData.getLandByState(state);
    let empty_lands = false;
    if (!arrayLength(landByState, 1)) empty_lands = true;
    return res.status(200).render("displayLandByState", {
      title: "Lands",
      landByState: landByState,
      state: state,
      empty_lands: empty_lands,
      userId: req.session.user.id,
      layout: false,
    });
    // return res.json(landByState);
  } catch (error) {
    return res.status(400).render("displayLandByState", {
      title: "Lands",
      landByState: [],
      state: undefined,
      hasSearchError: true,
      error: [error.message],
      userId: req.session.user.id,
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
      userId: req.session.user.id,
    });

  try {
    let filteredLands = await landData.filterByPrice(state, minPrice, maxPrice);
    let empty_lands = false;
    if (!arrayLength(filteredLands, 1)) empty_lands = true;
    return res.status(200).render("displayLandByState", {
      title: "Lands",
      landByState: filteredLands,
      state: state,
      empty_lands: empty_lands,
      userId: req.session.user.id,
    });
  } catch (error) {
    return res.status(400).render("displayLandByState", {
      title: "Lands",
      landByState: [],
      state: state,
      hasError: true,
      error: [error.message],
      userId: req.session.user.id,
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
      userId: req.session.user.id,
    });

  try {
    let filteredLands = await landData.filterByArea(state, minArea, maxArea);
    let empty_lands = false;
    if (!arrayLength(filteredLands, 1)) empty_lands = true;
    return res.status(200).render("displayLandByState", {
      title: "Lands",
      landByState: filteredLands,
      state: state,
      empty_lands: empty_lands,
      userId: req.session.user.id,
    });
  } catch (error) {
    return res.status(400).render("displayLandByState", {
      title: "Lands",
      landByState: [],
      state: state,
      hasError: true,
      error: [error.message],
      userId: req.session.user.id,
    });
  }
};

const placedBid = async (req, res) => {
  let bid = req.body.bidInput;
  let landId = req.params.landId;
  let sellerId = req.params.sellerId;
  let landPrice = req.body.price;
  let buyerId = req.session.user.id;
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
  if (!exists(buyerId)) error.push("buyerId parameter does not exists");
  if (!checkInputType(buyerId, "string"))
    error.push("buyerId must be of type string only");
  if (buyerId.trim().length === 0)
    error.push("buyerId cannot be of empty spaces");
  buyerId = buyerId.trim();
  if (!ObjectId.isValid(buyerId)) error.push("Invalid Object buyerId");
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
    await transactionData.createTransaction(bid, landId, sellerId, buyerId);
    return res.status(200).redirect("/land/" + landId);
  } catch (error) {
    return res.status(400).render("Error", {
      title: "Error",
      hasError: true,
      error: [error.message],
    });
  }
};

const updateLand = async (req, res) => {
  let landId = req.params.id;
  landId = validation.validObjectId(id);

  if (req.method == "get") {
    const result = await landData.getLand(landId);
    res.staus(200).render("editLand", {
      title: "Edit Land Information",
      result,
      id: landId,
    });
    return;
  } else {
    let {
      dimensionsLengthInput: length,
      dimensionsBreadthInput: breadth,
      typeInput: type,
      restrictionsInput: restrictions,
      line1Input: line1,
      line2Input: line2,
      zipCodeInput: zipCode,
      cityInput: city,
      stateInput: state,
      priceInput: price,
      onSaleInput: onSale,
    } = req.body;
    const queryData = {};

    //valid numbers
    queryData.dimensions.length = validation.validNumber(
      length,
      "length",
      (min = 1)
    );
    queryData.dimensions.breadth = validation.validNumber(
      breadth,
      "breadth",
      (min = 1)
    );
    queryData.sale.price = validation.validNumber(price, "Price", (min = 1));
    validation.validBool(onSale, "On sale");
    queryData.sale.onSale = onSale;

    //default behaviour
    queryData.landId = landId;

    if (onSale) {
      queryData.sale.dateOfListing = "11/11/1234"; // TODO: to be updated
    }

    //valid string and string of array
    queryData.type = validation.validString(type, "type of land", 20);

    //if not default then validation
    queryData.restrictions = validation.validArrayOfStrings(
      restrictions,
      "restrictions"
    );

    // valid address
    queryData.address.line1 = validation.validString(line1, "line1", 46);
    queryData.address.line2 = validation.validString(line2, "line2", 46);
    queryData.address.city = validation.validString(city, "city", 17);
    queryData.address.state = validation.validString(state, "state", 2);
    queryData.address.zipCode = validation.validString(
      zipCode,
      "zipCode",
      (min = 501),
      (max = 99950)
    );

    // Calculated field
    queryData.area = (dimensions.length * dimensions.breadth).toString();

    /*
    queryData has following structure
    queryDate = {
      dimensions:{
        lenght, 
        breadth
      },
      sale:{
        price,
        dateOfListing,
        onSale,
      },
      approved,
      restrictions:[],
      type,
      address:{
        line1,
        line2,
        city,
        state,
        zipCode
      },
      area
    }
    */
    let addLand;
    try {
      addLand = await landData.updateLand(queryData);
    } catch (error) {
      if (error == "Could not add land") {
        res
          .status(500)
          .render("error", { title: "Server Error", error: [error] });
        return;
      } else {
        res.status(400).render("editLand", {
          title: "Edit Land Information",
          id: landId,
          error: [error],
        }); //TODO: to be decided
        return;
      }
    }
    //if successfully added then redirect to my lands wala page
    res.status(200).redirect(`/land/${landId}`);
  }
};

const addNewLand = async (req, res) => {
  let {
    dimensionsLengthInput: length,
    dimensionsBreadthInput: breadth,
    typeInput: type,
    restrictionsInput: restrictions,
    line1Input: line1,
    line2Input: line2,
    zipCodeInput: zipCode,
    cityInput: city,
    stateInput: state,
  } = req.body; //elaborated address
  const queryData = {};

  //valid numbers
  queryData.dimensions.length = validation.validNumber(
    length,
    "length",
    (min = 1)
  );
  queryData.dimensions.breadth = validation.validNumber(
    breadth,
    "breadth",
    (min = 1)
  );

  //default behaviour
  queryData.sale.price = 1;
  queryData.sale.dateOfListing = "11/11/1234"; // TODO: to be updated
  queryData.sale.onSale = false;
  queryData.approved = false;
  queryData.restrictions = ["N/A"]; //TODO: having a default value in text field.

  //valid string and string of array
  queryData.type = validation.validString(type, "type of land", 20);

  //if not default then validation
  queryData.restrictions = validation.validArrayOfStrings(
    restrictions,
    "restrictions"
  );

  // valid address
  queryData.address.line1 = validation.validString(line1, "line1", 46);
  queryData.address.line2 = validation.validString(line2, "line2", 46);
  queryData.address.city = validation.validString(city, "city", 17);
  queryData.address.state = validation.validString(state, "state", 2);
  queryData.address.zipCode = validation.validString(
    zipCode,
    "zipCode",
    (min = 501),
    (max = 99950)
  );

  // Calculated field
  queryData.area = (dimensions.length * dimensions.breadth).toString();
  console.log(queryData);
  /*
  queryData has following structure
  queryDate = {
    dimensions:{
      lenght, 
      breadth
    },
    sale:{
      price,
      dateOfListing,
      onSale,
    },
    approved,
    restrictions:[],
    type,
    address:{
      line1,
      line2,
      city,
      state,
      zipCode
    },
    area
  }
  */
  let addLand;
  try {
    addLand = await landData.addNewLand(queryData);
  } catch (error) {
    if (error == "Could not add land") {
      res
        .status(500)
        .render("error", { title: "Server Error", error: [error] });
      return;
    } else {
      res.status(400).render("addNewLand", {
        title: "Add Land",
        id: req.session.user.id,
        error: [error],
      }); //TODO: to be decided
      return;
    }
  }
  //if successfully added then redirect to my lands wala page
  res.status(200).redirect(`/${req.session.user.id}/land`);
};
const addNewLandForm = async (req, res) => {
  console.log(req.session.user.id);
  res
    .status(200)
    .render("addNewLand", { title: "Add Land", id: req.session.user.id });
};

export {
  getLand,
  updateLand,
  addNewLand,
  getLandByState,
  postLandByState,
  postFilterArea,
  postFilterPrice,
  placedBid,
  addNewLandForm,
};
