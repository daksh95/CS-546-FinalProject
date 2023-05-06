import entityData from "../data/entities.js";
import transactionData from "../data/transactions.js";
import userData from "../data/user.js";
import landData from "../data/land.js";
import { exists } from "../utils/helpers.js";
import { ObjectId } from "mongodb";

const getHome = async (req, res) => {
  let id = req.session.user._id;
  let error = [];
  if (!exists(id)) error.push("ID parameter does not exists");
  if (!ObjectId.isValid(id)) error.push("Invalid Object ID");
  if (error.length !== 0)
    return res.status(400).render("Error", {
      title: "Error",
      hasError: true,
      error: error,
    });

  let entityName = undefined;
  let totalCount = 0;
  let pendingCount = 0;
  try {
    let entity = await entityData.getEntityById(id);
    entityName = entity.name;
    totalCount = await entityData.totalTransactionsCount(id);
    pendingCount = await entityData.pendingTransactionsCount(id);
    res.status(200).render("entity/entityHome", {
      id: id,
      name: entityName,
      total: totalCount,
      pending: pendingCount,
    });
  } catch (error) {
    res.status(404).render("Error", {
      title: "Error",
      hasError: true,
      error: [error.message],
    });
  }
};

const getProfile = async (req, res) => {
  let id = req.session.user.id;
  let error = [];
  if (!exists(id)) error.push("ID parameter does not exists");
  if (!ObjectId.isValid(id)) error.push("Invalid Object ID");
  if (error.length !== 0)
    return res.status(400).render("Error", {
      title: "Error",
      hasError: true,
      error: error,
    });

  const profileSetUp = await auth.getCredentialByEmailId(req.session.user.email);
    if(!profileSetUp.profileSetUpDone){
      let details ={};
      details.emailId = req.session.user.email; 
      details.url = `/entity/myProfile`;
      details.entity = true;
      details.role = req.session.user.typeOfUser;
      res.status(200).render("authentication/profileSetUp", {
        title: "Profile Set up", 
        details});
      return;
    }
  try {
    let entity = await entityData.getEntityById(id);
    res.render("entity/profile", {
      entity: entity,
    });
  } catch (error) {
    res.status(404).render("Error", {
      title: "Error",
      hasError: true,
      error: [error.message],
    });
  }
};

const allTransacs = async (req, res) => {
  let id = req.params.entityId;
  let error = [];
  if (!exists(id)) error.push("ID parameter does not exists");
  if (!ObjectId.isValid(id)) error.push("Invalid Object ID");
  if (error.length !== 0)
    return res.status(400).render("Error", {
      title: "Error",
      hasError: true,
      error: error,
    });

  try {
    let trans = await entityData.getTransactionsByEntityId(id);
    let entity = await entityData.getEntityById(id);
    let land_surveyor = false;
    let title_company = false;
    let government = false;
    if (entity.role === "land surveyor") land_surveyor = true;
    if (entity.role === "title company") title_company = true;
    if (entity.role === "government") government = true;
    res.render("entity/allTrans", {
      transactions: trans,
      landSurveyor: land_surveyor,
      titleC: title_company,
      govt: government,
    });
  } catch (error) {
    res.status(404).render("Error", {
      title: "Error",
      hasError: true,
      error: [error.message],
    });
  }
};

const pendingTransacs = async (req, res) => {
  let id = req.params.entityId;
  let error = [];
  if (!exists(id)) error.push("ID parameter does not exists");
  if (!ObjectId.isValid(id)) error.push("Invalid Object ID");
  if (error.length !== 0)
    return res.status(400).render("Error", {
      title: "Error",
      hasError: true,
      error: error,
    });

  try {
    let trans = await entityData.pendingTransactionsByEntityId(id);
    let entity = await entityData.getEntityById(id);
    let land_surveyor = false;
    let title_company = false;
    let government = false;
    if (entity.role === "land surveyor") land_surveyor = true;
    if (entity.role === "title company") title_company = true;
    if (entity.role === "government") government = true;
    res.render("entity/pendingTrans", {
      transactions: trans,
      landSurveyor: land_surveyor,
      titleC: title_company,
      govt: government,
    });
  } catch (error) {
    res.status(404).render("Error", {
      title: "Error",
      hasError: true,
      error: [error.message],
    });
  }
};

const transDetails = async (req, res) => {
  // get transaction by id -> ussmein se buyer id and seller id and land id nikal lo -> getUserById for both buyer and seller, getLandById -> print details of lands, buyer and seller
  // -> give radio or dropdown options of approve/rejected transaction and a comment box(compulsary) -> ajax/redirect-render(with red mein sentence "Your response has been sent!") same page again
  let transactionId = req.params.transactionId;
  let error = [];
  if (!exists(id)) error.push("ID parameter does not exists");
  if (!ObjectId.isValid(id)) error.push("Invalid Object ID");
  if (error.length !== 0)
    return res.status(400).render("Error", {
      title: "Error",
      hasError: true,
      error: error,
    });

  try {
    let transaction = await transactionData.getTransactionById(transactionId);
    let sellerId = transaction.seller._id;
    let buyerId = transaction.buyer._id;
    let landId = transaction.land._id;
    let seller = await userData.getUserById(sellerId);
    let buyer = await userData.getUserById(buyerId);
    let land = await landData.getLand(landId);
    let sellerRating = (
      seller.rating.totalRating / seller.rating.count
    ).toFixed(1);
    let buyerRating = (buyer.rating.totalRating / buyer.rating.count).toFixed(
      1
    );
    res.render("entity/transDetail", {
      transaction: transactiontransaction,
      seller: seller,
      sellerRating: sellerRating,
      buyer: buyer,
      buyerRating: buyerRating,
      land: land,
    });
  } catch (error) {
    res.status(404).render("Error", {
      title: "Error",
      hasError: true,
      error: [error.message],
    });
  }
};

const setUpProfile = async(req, res) =>{
  const {nameInput, phoneInput,emailIdInput, typeofGovernmentIdInput, governmentIdInput, dobInput, websiteInput, licenseInput } = req.body;
  
}

export { getHome, getProfile, allTransacs, pendingTransacs, transDetails, setUpProfile };
