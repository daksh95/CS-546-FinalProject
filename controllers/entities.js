import entityData from "../data/entities.js";
// import transactionData from "../data/transactions.js";
// import landData from "../data/land.js";
// import {
//   checkInputType,
//   exists,
//   validStateCodes,
//   inputValidation,
// } from "../utils/helpers.js";
import { ObjectId } from "mongodb";

const getTransactionsByEntityId = async (req, res) => {
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

  let trans = undefined;
  try {
    trans = await entityData.getTransactionsByEntityId(id);
  } catch (error) {
    res.status(404).render("Error", {
      title: "Error",
      hasError: true,
      error: [error.message],
    });
  }

  try {
    const entity = await entityData.getEntityById(id);

    res
      .status(200)
      .render("entityHome", { transactions: trans, entityDetails: entity });
  } catch (error) {
    res.status(404).render("Error", {
      title: "Error",
      hasError: true,
      error: [error.message],
    });
  }
};

// const getTransactionsByEntityId = async (req, res) => {};
// /transaction/id - route
