import entityData from "../data/entities.js";
import transactionData from "../data/transactions.js";
import userData from "../data/user.js";
import landData from "../data/land.js";
import credentialData from "../data/credential.js";

import { exists } from "../utils/helpers.js";
import { ObjectId } from "mongodb";
import xss from "xss";

const getHome = async (req, res) => {
  let id = req.session.user.id;

  if (!id)
    return res.status(500).render("error", {
      title: "Error",
      hasError: true,
      error: ["Session details missing!"],
    });

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

    if (!entity)
      return res.status(500).render("error", {
        title: "Error",
        hasError: true,
        error: ["Internal Server Error"],
      });

    if (entity.approved === "pending")
      return res.status(200).render("approvalWaiting", {
        title: "Approval pending",
      });

    if (entity.approved === "rejected")
      return res.status(200).render("accountRejected", {
        title: "Approval rejected",
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
  let email = req.session.user.email;
  let role = req.session.user.typeOfUser;

  if (!id || !email || !typeOfUser)
    return res.status(500).render("error", {
      title: "Error",
      hasError: true,
      error: ["Session details missing!"],
    });

  let error = [];
  if (!exists(id)) error.push("ID parameter does not exists");
  if (!ObjectId.isValid(id)) error.push("Invalid Object ID");
  if (typeof email !== "string") error.push("Email address must be a string!");
  if (email.trim().length === 0)
    error.push("Email address cannot be an empty string or just spaces!");
  let bleh = new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
  if (!bleh.test(email)) error.push("Invalid email address!");
  email = email.trim().toLowerCase();
  role = role.toLowerCase();
  if (
    role !== "landsurveyor" &&
    role !== "titlecompany" &&
    role !== "government"
  )
    error.push("Invalid role!");

  if (error.length !== 0)
    return res
      .status(400)
      .render("error", { title: "Error", hasError: true, error: error });

  const profileSetUp = await credentialData.getCredentialByEmailId(email);

  if (!profileSetUp)
    return res.status(500).render("error", {
      title: "Error",
      hasError: true,
      error: ["Internal Server Error"],
    });

  if (!profileSetUp.profileSetUpDone) {
    let details = {};
    details.emailId = email;
    details.url = `/entity/myProfile`;
    details.entity = true;
    details.role = role;
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

    res.status(200).render("entity/profile", {
      entity: entity,
    });
  } catch (error) {
    return res
      .status(400)
      .render("error", { title: "Error", hasError: true, error: [error] });
  }
};

const setUpProfile = async (req, res) => {
  const email = req.session.user.email;

  if (!email)
    return res.status(500).render("error", {
      title: "Error",
      hasError: true,
      error: ["Session details missing!"],
    });

  let error = [];
  if (typeof email !== "string") error.push("Email address must be a string!");
  if (email.trim().length === 0)
    error.push("Email address cannot be an empty string or just spaces!");
  let bleh = new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
  if (!bleh.test(email)) error.push("Invalid email address!");

  if (error.length !== 0)
    return res.status(400).render("error", {
      title: "Error",
      hasError: true,
      error: error,
    });

  try {
    let { nameInput, phoneInput, websiteInput, licenseInput } = req.body;

    error = [];
    if (!nameInput || !phoneInput || !websiteInput || !licenseInput)
      error.push("Recheck your inputs, one or more inputs are missing!");
    if (typeof nameInput !== "string")
      error.push("Entity name must be a string!");
    if (nameInput.trim().length === 0)
      error.push("Entity name cannot be an empty string or just spaces!");
    nameInput = nameInput.trim();
    if (typeof phoneInput !== "string")
      error.push("Contact number must be a string!");
    if (phoneInput.length !== 10)
      error.push("Input a valid 10-digit contact number!");
    if (typeof websiteInput !== "string")
      error.push("Band website must be a string!");
    if (websiteInput.trim().length === 0)
      error.push("Band website cannot be an empty string or just spaces!");
    const regex = new RegExp(/^http:\/\/www\.[\w\W]{5,}\.com$/i);
    if (!regex.test(websiteInput)) error.push("Invalid entity website!");
    websiteInput = websiteInput.trim();
    if (typeof licenseInput !== "string")
      error.push("Entity license must be a string!");
    if (licenseInput.trim().length === 0)
      error.push("Entity license cannot be an empty string or just spaces!");
    licenseInput = licenseInput.trim();

    if (error.length !== 0)
      return res.status(400).render("error", {
        title: "Error",
        hasError: true,
        error: error,
      });

    let newEntity = await entityData.addNewEntity(
      xss(nameInput),
      xss(phoneInput),
      xss(email),
      xss(websiteInput),
      xss(licenseInput)
    );

    if (!newEntity)
      return res.status(500).render("error", {
        title: "Error",
        hasError: true,
        error: ["Internal Server Error"],
      });

    let creds = req.session.user.credentialId;

    if (!creds)
      return res.status(500).render("error", {
        title: "Error",
        hasError: true,
        error: ["Session details missing!"],
      });

    await credentialData.updateProfileStatus(creds, true);
    res.status(200).render("approvalWaiting", {
      title: "Approval pending",
    });
  } catch (error) {
    return res
      .status(400)
      .render("error", { title: "Error", hasError: true, error: [error] });
  }
};

const updationFrom = async (req, res) => {
  const entityId = req.params.entityId;

  if (!entityId)
    return res.status(500).render("error", {
      title: "Error",
      hasError: true,
      error: ["Params details missing!"],
    });

  let error = [];
  if (!exists(entityId)) error.push("ID parameter does not exists");
  if (!ObjectId.isValid(entityId)) error.push("Invalid Object ID");

  if (error.length !== 0)
    return res
      .status(400)
      .render("error", { title: "Error", hasError: true, error: error });

  try {
    const entity = await entityData.getEntityById(entityId);

    if (!entity)
      return res.status(500).render("error", {
        title: "Error",
        hasError: true,
        error: ["Internal Server Error"],
      });

    error = [];
    if (typeof entity.emailId !== "string")
      error.push("Email address must be a string!");
    if (entity.emailId.trim().length === 0)
      error.push("Email address cannot be an empty string or just spaces!");
    let bleh = new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
    if (!bleh.test(entity.emailId)) error.push("Invalid email address!");
    entity.role = entity.role.toLowerCase();
    if (
      entity.role !== "landsurveyor" &&
      entity.role !== "titlecompany" &&
      entity.role !== "government"
    )
      error.push("Invalid role!");

    if (error.length !== 0)
      return res.status(400).render("error", {
        title: "Error",
        hasError: true,
        error: error,
      });

    let details = {};
    details.emailId = entity.emailId;
    details.url = `/entity/myProfile`;
    details.entity = true;
    details.role = entity.role;
    res.status(200).render("authentication/profileSetUp", {
      title: "Profile Set up",
      details,
    });
  } catch (error) {
    return res
      .status(400)
      .render("error", { title: "Error", hasError: true, error: [error] });
  }
};

const update = async (req, res) => {
  const email = req.session.user.email;

  if (!email)
    return res.status(500).render("error", {
      title: "Error",
      hasError: true,
      error: ["Session details missing!"],
    });

  let error = [];
  if (typeof email !== "string") error.push("Email address must be a string!");
  if (email.trim().length === 0)
    error.push("Email address cannot be an empty string or just spaces!");
  let bleh = new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
  if (!bleh.test(email)) error.push("Invalid email address!");

  if (error.length !== 0)
    return res.status(400).render("error", {
      title: "Error",
      hasError: true,
      error: error,
    });

  try {
    let { nameInput, phoneInput, websiteInput, licenseInput } = req.body;

    error = [];
    if (!nameInput || !phoneInput || !websiteInput || !licenseInput)
      error.push("Recheck your inputs, one or more inputs are missing!");
    if (typeof nameInput !== "string")
      error.push("Entity name must be a string!");
    if (nameInput.trim().length === 0)
      error.push("Entity name cannot be an empty string or just spaces!");
    nameInput = nameInput.trim();
    if (typeof phoneInput !== "string")
      error.push("Contact number must be a string!");
    if (phoneInput.length !== 10)
      error.push("Input a valid 10-digit contact number!");
    if (typeof websiteInput !== "string")
      error.push("Band website must be a string!");
    if (websiteInput.trim().length === 0)
      error.push("Band website cannot be an empty string or just spaces!");
    const regex = new RegExp(/^http:\/\/www\.[\w\W]{5,}\.com$/i);
    if (!regex.test(websiteInput)) error.push("Invalid entity website!");
    websiteInput = websiteInput.trim();
    if (typeof licenseInput !== "string")
      error.push("Entity license must be a string!");
    if (licenseInput.trim().length === 0)
      error.push("Entity license cannot be an empty string or just spaces!");
    licenseInput = licenseInput.trim();

    if (error.length !== 0)
      return res.status(400).render("error", {
        title: "Error",
        hasError: true,
        error: error,
      });

    let newEntity = await entityData.addNewEntity(
      xss(nameInput),
      xss(phoneInput),
      xss(email),
      xss(websiteInput),
      xss(licenseInput)
    );

    if (!newEntity)
      return res.status(500).render("error", {
        title: "Error",
        hasError: true,
        error: ["Internal Server Error"],
      });

    res.status(200).render("approvalWaiting", {
      title: "Approval pending",
    });
  } catch (error) {
    return res
      .status(400)
      .render("error", { title: "Error", hasError: true, error: [error] });
  }
};

const allTransacs = async (req, res) => {
  let id = req.params.entityId;

  if (!id)
    return res.status(500).render("error", {
      title: "Error",
      hasError: true,
      error: ["Params details missing!"],
    });

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

    if (entity.role === "landsurveyor") land_surveyor = true;
    else if (entity.role === "titlecompany") title_company = true;
    else if (entity.role === "government") government = true;
    else
      return res.status(500).render("error", {
        title: "Error",
        hasError: true,
        error: ["Invalid role!"],
      });

    res.status(200).render("entity/allTrans", {
      length: Boolean(trans.length),
      id: id,
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

  if (!id)
    return res.status(500).render("error", {
      title: "Error",
      hasError: true,
      error: ["Params details missing!"],
    });

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
    if (entity.role === "landsurveyor") land_surveyor = true;
    else if (entity.role === "titlecompany") title_company = true;
    else if (entity.role === "government") government = true;
    else
      return res.status(500).render("error", {
        title: "Error",
        hasError: true,
        error: ["Invalid role!"],
      });

    res.status(200).render("entity/pendingTrans", {
      length: Boolean(trans.length),
      id: id,
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
  let entityId = req.params.entityId;
  let transactionId = req.params.transactionId;

  if (!entityId || !transactionId)
    return res.status(500).render("error", {
      title: "Error",
      hasError: true,
      error: ["Params details missing!"],
    });

  let error = [];
  if (!exists(entityId) || !exists(transactionId))
    error.push("ID parameter does not exists");
  if (!ObjectId.isValid(entityId) || !ObjectId.isValid(transactionId))
    error.push("Invalid Object ID");

  if (error.length !== 0)
    return res
      .status(400)
      .render("error", { title: "Error", hasError: true, error: error });

  try {
    let entity = await entityData.getEntityById(entityId);
    let transaction = await transactionData.getTransactionById(transactionId);

    if (!entity || !transaction)
      return res.status(500).render("error", {
        title: "Error",
        hasError: true,
        error: ["Internal Server Error"],
      });

    let sellerId = transaction.seller._id;
    let buyerId = transaction.buyer._id;
    let landId = transaction.land._id;

    if (!exists(sellerId) || !exists(buyerId) || !exists(landId))
      error.push("ID parameter does not exists");
    if (
      !ObjectId.isValid(sellerId) ||
      !ObjectId.isValid(buyerId) ||
      !ObjectId.isValid(landId)
    )
      error.push("Invalid Object ID");

    let seller = await userData.getUserById(sellerId);
    let buyer = await userData.getUserById(buyerId);
    let land = await landData.getLand(landId);

    if (!seller || !buyer || !land)
      return res.status(500).render("error", {
        title: "Error",
        hasError: true,
        error: ["Internal Server Error"],
      });

    let sellerRating = undefined;
    if (seller.rating.count === 0) {
      sellerRating = 0;
    } else {
      sellerRating = (seller.rating.totalRating / seller.rating.count).toFixed(
        1
      );
    }

    let buyerRating = undefined;
    if (buyer.rating.count === 0) {
      buyerRating = 0;
    } else {
      buyerRating = (buyer.rating.totalRating / buyer.rating.count).toFixed(1);
    }

    let entityRole = entity.role;
    let isPending = undefined;
    let isApproved = undefined;
    let isRejected = undefined;
    let comment = undefined;
    if (entityRole === "landsurveyor") {
      isPending = transaction.surveyor.status.toLowerCase() === "pending";
      isApproved = transaction.surveyor.status.toLowerCase() === "approved";
      isRejected = transaction.surveyor.status.toLowerCase() === "rejected";
      comment = transaction.surveyor.Comment;
    } else if (entityRole === "titlecompany") {
      isPending = transaction.titleCompany.status.toLowerCase() === "pending";
      isApproved = transaction.titleCompany.status.toLowerCase() === "approved";
      isRejected = transaction.titleCompany.status.toLowerCase() === "rejected";
      comment = transaction.titleCompany.Comment;
    } else if (entityRole === "government") {
      isPending = transaction.government.status.toLowerCase() === "pending";
      isApproved = transaction.government.status.toLowerCase() === "approved";
      isRejected = transaction.government.status.toLowerCase() === "rejected";
      comment = transaction.government.Comment;
    } else {
      return res.status(400).render("error", {
        title: "Error",
        hasError: true,
        error: ["Invalid role!"],
      });
    }

    res.status(200).render("entity/transDetail", {
      title: "Transaction details",
      id: entity._id,
      transaction: transaction,
      seller: seller,
      sellerRating: sellerRating,
      buyer: buyer,
      buyerRating: buyerRating,
      land: land,
      isPending,
      isApproved,
      isRejected,
      comment,
    });
  } catch (error) {
    return res
      .status(400)
      .render("error", { title: "Error", hasError: true, error: [error] });
  }
};

const response = async (req, res) => {
  const status = req.body.approval;
  const com = req.body.comment;
  const entityId = req.params.entityId;
  const transactionId = req.params.transactionId;

  if (!status || !com || !entityId || !transactionId)
    return res.status(500).render("error", {
      title: "Error",
      hasError: true,
      error: ["Params or request body details missing!"],
    });

  let error = [];
  if (status !== "approved" || status !== "rejected")
    error.push("Invalid status update!");
  if (typeof comment !== "string") error.push("Comment must be a string!");
  if (comment.trim().length === 0)
    error.push("Comment box cannot be empty or just spaces!");
  comment = comment.trim();
  if (!exists(entityId) || !exists(transactionId))
    error.push("ID parameter does not exists");
  if (!ObjectId.isValid(entityId) || !ObjectId.isValid(transactionId))
    error.push("Invalid Object ID");

  if (error.length !== 0)
    return res
      .status(400)
      .render("error", { title: "Error", hasError: true, error: error });

  let entityRole = undefined;

  try {
    const entity = await entityData.getEntityById(entityId);

    if (!entity)
      return res.status(500).render("error", {
        title: "Error",
        hasError: true,
        error: ["Internal Server Error"],
      });

    entityRole = entity.role;

    entityRole = entityRole.toLowerCase();
    if (
      entityRole !== "landsurveyor" &&
      entityRole !== "titlecompany" &&
      entityRole !== "government"
    )
      return res.status(400).render("error", {
        title: "Error",
        hasError: true,
        error: ["Invalid role!"],
      });

    let success = undefined;

    if (status === "approved") {
      success = await entityData.entityApproved(
        transactionId,
        xss(com),
        entityRole
      );
    } else if (status === "rejected") {
      success = await entityData.entityTerminateTransaction(
        transactionId,
        com,
        entityRole
      );
    }

    if (typeof success === "undefined")
      return res.status(500).render("error", {
        title: "Error",
        hasError: true,
        error: ["Internal Server Error"],
      });

    return res
      .status(200)
      .redirect("/:entityId/transactionDetails/:transactionId");
  } catch (error) {
    return res
      .status(400)
      .render("error", { title: "Error", hasError: true, error: [error] });
  }
};

export {
  getHome,
  getProfile,
  setUpProfile,
  updationFrom,
  update,
  allTransacs,
  pendingTransacs,
  transDetails,
  response,
};
