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
import xss from "xss";

const getLand = async (req, res) => {
  // // console.log("here");
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
    let transactions = await transactionData.getTransactionsByLandId(
      id.toString()
    );
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
    let landByState = await landData.getLandByState(xss(state));
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
    let filteredLands = await landData.filterByArea(
      state,
      xss(minArea),
      xss(maxArea)
    );
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
  let bid = parseInt(req.body.bidInput);
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
    // console.log(error);
    return res.status(400).render("Error", {
      title: "Error",
      hasError: true,
      error: [error.message],
    });
  }
};

const updateLand = async (req, res) => {
  // let landId = req.params.id;
  // landId = validation.validObjectId(id);

  // if (req.method == "get") {
  //   const result = await landData.getLand(landId);
  //   res.staus(200).render("editLand", {
  //     title: "Edit Land Information",
  //     result,
  //     id: landId,
  //   });
  //   return;
  // } else {
  //   let {
  //     dimensionsLengthInput: length,
  //     dimensionsBreadthInput: breadth,
  //     typeInput: type,
  //     restrictionsInput: restrictions,
  //     line1Input: line1,
  //     line2Input: line2,
  //     zipCodeInput: zipCode,
  //     cityInput: city,
  //     stateInput: state,
  //     priceInput: price,
  //     onSaleInput: onSale,
  //   } = req.body;
  //   const queryData = {};

  //   //valid numbers
  //   queryData.dimensions.length = validation.validNumber(
  //     length,
  //     "length",
  //     (min = 1)
  //   );
  //   queryData.dimensions.breadth = validation.validNumber(
  //     breadth,
  //     "breadth",
  //     (min = 1)
  //   );
  //   queryData.sale.price = validation.validNumber(price, "Price", (min = 1));
  //   validation.validBool(onSale, "On sale");
  //   queryData.sale.onSale = onSale;

  //   //default behaviour
  //   queryData.landId = landId;

  //   if (onSale) {
  //     queryData.sale.dateOfListing = "11/11/1234"; // TODO: to be updated
  //   }

  //   //valid string and string of array
  //   queryData.type = validation.validString(type, "type of land", 20);

  //   //if not default then validation
  //   queryData.restrictions = validation.validArrayOfStrings(
  //     restrictions,
  //     "restrictions"
  //   );

  //   // valid address
  //   queryData.address.line1 = validation.validString(line1, "line1", 46);
  //   queryData.address.line2 = validation.validString(line2, "line2", 46);
  //   queryData.address.city = validation.validString(city, "city", 17);
  //   queryData.address.state = validation.validString(state, "state", 2);
  //   queryData.address.zipCode = validation.validString(
  //     zipCode,
  //     "zipCode",
  //     (min = 501),
  //     (max = 99950)
  //   );

  //   // Calculated field
  //   queryData.area = (dimensions.length * dimensions.breadth).toString();

  //   /*
  //   queryData has following structure
  //   queryDate = {
  //     dimensions:{
  //       lenght, 
  //       breadth
  //     },
  //     sale:{
  //       price,
  //       dateOfListing,
  //       onSale,
  //     },
  //     approved,
  //     restrictions:[],
  //     type,
  //     address:{
  //       line1,
  //       line2,
  //       city,
  //       state,
  //       zipCode
  //     },
  //     area
  //   }
  //   */
  //   let addLand;
  //   try {
  //     addLand = await landData.updateLand(queryData);
  //   } catch (error) {
  //     if (error == "Could not add land") {
  //       res
  //         .status(500)
  //         .render("error", { title: "Server Error", error: [error] });
  //       return;
  //     } else {
  //       res.status(400).render("editLand", {
  //         title: "Edit Land Information",
  //         id: landId,
  //         error: [error],
  //       }); //TODO: to be decided
  //       return;
  //     }
  //   }

  //   //if successfully added then redirect to my lands wala page
  //   res.redirect(`/land/${landId}`);
  // }
};

const addNewLand = async (req, res) => {
  let {
    dimensionsLengthInput: length,
    dimensionsBreadthInput: breadth,
    typeInput: type,
    restrictionsInput: restrictionsText,
    line1Input: line1,
    line2Input: line2,
    zipCodeInput: zipCode,
    cityInput: city,
    stateInput: state,
    restrictions
  } = req.body; 
  console.log(req.body);
  const queryData = {};
  const details={};

  length = parseInt(length);
  breadth = parseInt(breadth);
  let errors =[];

  //length validation
  try {
    if(typeof length == "undefined"){
      details["length"] = "";
    }
    else{
      details["length"] = length;
    }
    length = validation.validNumber(length, "length", 1);
  } catch (e) {
    errors.push(e);
  }

  //breadth validation
  try {
    if(typeof breadth == "undefined"){
      details["breadth"] = "";
    }
    else{
      details["breadth"] = breadth;
    }
    breadth = validation.validNumber(breadth, "breadth", 1);
  } catch (e) {
    errors.push(e);
  }

  //default values
  queryData.approved = "pending";

  //valid land type
  try {
    if(typeof type == "undefined"){
      details["type"] = "";
    }
    else{
      details["type"] = type;
    }
    queryData.type = validation.validLandType(type);
  } catch (e) {
    errors.push(e);

  }

  // valid address line 1
  try {
    if(typeof line1 == "undefined"){
      details["line1"] = "";
    }
    else{
      details["line1"] = line1;
    }
    line1 = validation.validString(line1, "line1", 46);
  } catch (e) {
    errors.push(e)
  }

  // valid address line 2
    if(typeof line2 == "undefined"){
      details["line2"] = "";
    }else{
      details["line2"] = line2;
    }
    line2 = line2.trim();
    if(line2.length>46){
      errors.push("line2 shouldn't be longer that 46 characters");
    }
  

  // valid address city
  try {
    if(typeof city == "undefined"){
      details["city"] = "";
    }else{
      details["city"] = city;
    }
    city = validation.validString(city, "city", 17);
  } catch (e) {
    errors.push(e);
  }

  //valid address state
  try {
    if(typeof state == "undefined"){
      details["state"] = "";
    }else{
      details["state"] = state;
    }
    state = validation.validState(state);
  } catch (e) {
    errors.push(e);
  }

  //valid address zipcode
  try {
    if(typeof zipCode == "undefined"){
      details["zipCode"] = "";
    }else{
      details["zipCode"] = zipCode;
    }
    zipCode = validation.validZip(zipCode,state, city);
  } catch (e) {
    errors.push(e);
  }

  queryData.address = {
    line1: line1,
    line2: line2,
    city: city,
    state: state,
    zipCode: zipCode,
  };
  //if no restriction and no text.
  if(typeof restrictions == "undefined" && restrictionsText.trim().length==0){
    errors.push(`If you don't have any restrictions, please select 'No restrictions`);
  }
  let count = 0;
  let noRestriction =0;
  //validating check restrictions
  try {
    if(typeof restrictions != "undefined"){
      if(typeof restrictions == "string"){
        let temp = restrictions;
        restrictions =[temp];
        for (let restri of restrictions){
          count = count+1;
            if(restri.toLowerCase() == "No restrictions".toLowerCase()){
              noRestriction= true;
            }
          }      
      }
      restrictions = validation.validArrayOfStrings(restrictions,"Restriction list");
      queryData["restrictions"] = restrictions;
    }
  } catch (e) {
    errors.push(e);
  } 

  //validating text restriction
  if(restrictionsText.trim().length>0){ 
    count = count+1;
    details["restrictionsText"] = restrictionsText; 
    restrictionsText = validation.validString(restrictionsText, "restriction text", 400);
    let restrictionsTextArray = restrictionsText.split(",");
    try {
      restrictionsTextArray= validation.validArrayOfStrings(restrictionsTextArray,"Restriction text list");
      
      //adding text restriction into restrictions array
      if(typeof restrictions != "undefined"){
        for(let restrict of restrictionsTextArray ){
            restrictions.push(restrict);
        }
        queryData["restrictions"] = restrictions;
      }
      //if no restrictions array exist then store the values in queryData 
      else{
        queryData["restrictions"] = restrictionsTextArray;
      }
    } catch (e) {
      errors.push(e);
      }
  }
  if(count>1 && noRestriction == true){
    errors.push(`Please verify your input as it seems that you have selected "No restrictions" and other restrictions, which contradict each other.`)
  }

  // Calculated field
  console.log(queryData);
  queryData.dimensions = {
    length: length,
    breadth: breadth,
  };
  if(errors.length>0){
    res.status(400).render("addNewLand", {  
      title: "Add Land",
      id: req.session.user.id,
      hasError: true,
      error: [errors],
      hasDetails:true,
      details
   });
   return;
  }

  let addLand;
  try {
    addLand = await landData.addNewLand(queryData);
  } catch (error) {
    if (error == "Could not add land") {
      res
        .status(500)
        .render("error", { title: "Server Error", hasError: true, error: [error] });
      return;
    } else {
      res.status(400).render("addNewLand", {
        title: "Add Land",
        id: req.session.user.id,
        hasError: true,
        error: [error],
      }); //TODO: to be decided
      return;
    }
  }
  //if successfully added then redirect to my lands wala page
  // // console.log(req.session.user.id, new ObjectId (addLand._id));
  
  const resul = await userData.addLandToUser(req.session.user.id, addLand._id);
  // // console.log(resul);

  res.redirect(`/user/${req.session.user.id}/land`);
  return;
};

const addNewLandForm = async (req, res) => {
  res
    .status(200)
    .render("addNewLand", { title: "Add Land", id: req.session.user.id });
};

const postLandonSale = async (req, res) => {
  let price = req.body.priceInput;
  let landId = req.params.id;
  price = parseInt(price);
  let error = [];
  if (!exists(landId)) error.push("ID parameter does not exists");
  if (!checkInputType(landId, "string"))
    error.push("ID must be of type string only");
  if (landId.trim().length === 0) error.push("ID cannot be of empty spaces");
  landId = landId.trim();
  if (!ObjectId.isValid(landId)) error.push("Invalid Object ID");
  if (!exists(price)) error.push("Price parameter does not exists");
  if (!checkInputType(price, "number") || price === NaN || price === Infinity)
    error.push("Price must be of type number only");
  if (error.length !== 0)
    return res.status(400).render("error", {
      title: "Error",
      hasError: true,
      error: error,
    });

  try {
    await landData.putOnSale(landId, price);
    res.redirect("/land/" + landId);
  } catch (error) {
    return res.status(400).render("error", {
      title: "Error",
      hasError: true,
      error: [error.message],
    });
  }
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
  postLandonSale,
};
