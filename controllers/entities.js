import entityData from "../data/entities.js";
import transactionData from "../data/transactions.js";
import userData from "../data/user.js";
import landData from "../data/land.js";
import credentialData from "../data/credential.js";

import { exists } from "../utils/helpers.js";
import { ObjectId } from "mongodb";

const getHome = async (req, res) => {
  let id = req.session.user.id;
  let error = [];
  if (!exists(id)) error.push("ID parameter does not exists");
  if (!ObjectId.isValid(id)) error.push("Invalid Object ID");
  if (error.length !== 0)
    return res
      .status(400)
      .render("error", { title: "Error", hasError: true, error: error });

  let entityName = undefined;
  let totalCount = 0;
  let pendingCount = 0;

  try {
    let entity = await entityData.getEntityById(id);
    entityName = entity.name;
    totalCount = await entityData.totalTransactionsCount(id);
    pendingCount = await entityData.pendingTransactionsCount(id);

    if (!entity || !totalCount || !pendingCount)
      return res.status(500).render("error", {
        title: "Error",
        hasError: true,
        error: ["Internal Server Error"],
      });

    res.status(200).render("entity/entityHome", {
      id: id,
      name: entityName,
      total: totalCount,
      pending: pendingCount,
    });
  } catch (error) {
    return res
      .status(400)
      .render("error", { title: "Error", hasError: true, error: [error] });
  }
};

const getProfile = async (req, res) => {
  let id = req.session.user.id;
  let error = [];
  if (!exists(id)) error.push("ID parameter does not exists");
  if (!ObjectId.isValid(id)) error.push("Invalid Object ID");
  if (error.length !== 0)
    return res
      .status(400)
      .render("error", { title: "Error", hasError: true, error: error });

  const profileSetUp = await credentialData.getCredentialByEmailId(
    req.session.user.email
  );

  if (!profileSetUp)
    return res.status(500).render("error", {
      title: "Error",
      hasError: true,
      error: ["Internal Server Error"],
    });

  if (!profileSetUp.profileSetUpDone) {
    let details = {};
    details.emailId = req.session.user.email;
    details.url = `/entity/myProfile`;
    details.entity = true;
    details.role = req.session.user.typeOfUser;
    res.status(200).render("authentication/profileSetUp", {
      title: "Profile Set up",
      details,
    });
    return;
  }

  try {
    let entity = await entityData.getEntityById(id);

    if (!entity)
      return res.status(500).render("error", {
        title: "Error",
        hasError: true,
        error: ["Internal Server Error"],
      });

    res.render("entity/profile", {
      entity: entity,
    });
  } catch (error) {
    return res
      .status(400)
      .render("error", { title: "Error", hasError: true, error: [error] });
  }
};

const allTransacs = async (req, res) => {
  let id = req.params.entityId;
  let error = [];
  if (!exists(id)) error.push("ID parameter does not exists");
  if (!ObjectId.isValid(id)) error.push("Invalid Object ID");
  if (error.length !== 0)
    return res
      .status(400)
      .render("error", { title: "Error", hasError: true, error: error });

  try {
    let trans = await entityData.getTransactionsByEntityId(id);
    let entity = await entityData.getEntityById(id);

    if (!entity || !trans)
      return res.status(500).render("error", {
        title: "Error",
        hasError: true,
        error: ["Internal Server Error"],
      });

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
    return res
      .status(400)
      .render("error", { title: "Error", hasError: true, error: [error] });
  }
};

const pendingTransacs = async (req, res) => {
  let id = req.params.entityId;
  let error = [];
  if (!exists(id)) error.push("ID parameter does not exists");
  if (!ObjectId.isValid(id)) error.push("Invalid Object ID");
  if (error.length !== 0)
    return res
      .status(400)
      .render("error", { title: "Error", hasError: true, error: error });

  try {
    let trans = await entityData.pendingTransactionsByEntityId(id);
    let entity = await entityData.getEntityById(id);

    if (!entity || !trans)
      return res.status(500).render("error", {
        title: "Error",
        hasError: true,
        error: ["Internal Server Error"],
      });

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
    return res
      .status(400)
      .render("error", { title: "Error", hasError: true, error: [error] });
  }
};

const transDetails = async (req, res) => {
  let transactionId = req.params.transactionId;
  let error = [];
  if (!exists(id)) error.push("ID parameter does not exists");
  if (!ObjectId.isValid(id)) error.push("Invalid Object ID");
  if (error.length !== 0)
    return res
      .status(400)
      .render("error", { title: "Error", hasError: true, error: error });

  try {
    let transaction = await transactionData.getTransactionById(transactionId);

    if (!transaction)
      return res.status(500).render("error", {
        title: "Error",
        hasError: true,
        error: ["Internal Server Error"],
      });

    let sellerId = transaction.seller._id;
    let buyerId = transaction.buyer._id;
    let landId = transaction.land._id;
    let seller = await userData.getUserById(sellerId);
    let buyer = await userData.getUserById(buyerId);
    let land = await landData.getLand(landId);

    if (!seller || !buyer || !land)
      return res.status(500).render("error", {
        title: "Error",
        hasError: true,
        error: ["Internal Server Error"],
      });

    let sellerRating = (
      seller.rating.totalRating / seller.rating.count
    ).toFixed(1);
    let buyerRating = (buyer.rating.totalRating / buyer.rating.count).toFixed(
      1
    );
    res.status(200).render("entity/transDetail", {
      title: "Transaction details",
      transaction: transactiontransaction,
      seller: seller,
      sellerRating: sellerRating,
      buyer: buyer,
      buyerRating: buyerRating,
      land: land,
    });
  } catch (error) {
    return res
      .status(400)
      .render("error", { title: "Error", hasError: true, error: [error] });
  }
};

const setUpProfile = async (req, res) => {
  const email = req.session.user.email;
  let error = [];
  if (typeof email !== "string") error.push("Email address must be a string!");
  if (email.trim().length === 0)
    error.push("Email address cannot be an empty string or just spaces!");
  let bleh = /^[^s@]+@[^s@]+.[^s@]+$/;
  if (!bleh.test(email)) error.push("Invalid email address!");
  if (error.length !== 0)
    return res.status(400).render("error", {
      title: "Error",
      hasError: true,
      error: error,
    });

  try {
    let { nameInput, phoneInput, websiteInput, licenseInput } = req.body;
    phoneInput = parseInt(phoneInput);
    await entityData.addNewEntity(
      nameInput,
      phoneInput,
      email,
      websiteInput,
      licenseInput
    );
    await credentialData.updateProfileStatus(
      res.session.user.credentialId,
      true
    );
    res.status(200).render("approvalWaiting", {
      title: "Approval pending",
    });
  } catch (error) {
    return res
      .status(400)
      .render("error", { title: "Error", hasError: true, error: [error] });
  }
};

export {
  getHome,
  getProfile,
  allTransacs,
  pendingTransacs,
  transDetails,
  setUpProfile,
};
