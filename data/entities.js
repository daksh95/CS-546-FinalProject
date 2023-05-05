import { ObjectId } from "mongodb";
import { getClient } from "../config/connection.js";
import { entityCollection, transacsCollection } from "./collectionNames.js";

const addNewEntity = async (
  name,
  contactNumber,
  emailId,
  website,
  license,
  role
) => {
  if (!name || !contactNumber || !emailId || !website || !license || !role)
    throw `Recheck your inputs, one or more inputs are missing!`;

  if (typeof name !== "string") throw `Entity name must be a string!`;
  if (name.trim().length === 0)
    throw `Entity name cannot be an empty string or just spaces!`;
  name = name.trim();

  if (typeof contactNumber !== "number")
    throw `Contact number must be a number!`;
  let numStr = contactNumber.toString();
  if (numStr.length !== 10) throw `Input a valid 10-digit contact number!`;

  if (typeof emailId !== "string") throw `Email address must be a string!`;
  if (emailId.trim().length === 0)
    throw `Email address cannot be an empty string or just spaces!`;
  let bleh = /^[^s@]+@[^s@]+.[^s@]+$/;
  if (!bleh.test(emailId)) throw `Invalid email address!`;
  emailId = emailId.trim().toLowerCase();

  if (typeof website !== "string") throw `Band website must be a string!`;
  if (website.trim().length === 0)
    throw `Band website cannot be an empty string or just spaces!`;
  if (
    !website.includes("http://www.") ||
    !website.includes(".com") ||
    website.trim().length < 17
  )
    throw `Invalid entity website!`;
  website = website.trim();

  if (typeof license !== "string") throw `Entity license must be a string!`;
  if (license.trim().length === 0)
    throw `Entity license cannot be an empty string or just spaces!`;
  license = license.trim();

  role = role.toLowerCase();
  if (
    role !== "land surveyor" &&
    role !== "title company" &&
    role !== "government"
  )
    throw `Invalid role!`;

  const client = getClient();
  const entityData = client.collection(entityCollection);
  let meh = await entityData.findOne({ emailId: emailId });
  if (meh !== null) throw `Email address already in use!`;

  let newEntity = {
    name: name,
    contactNumber: contactNumber,
    emailId: emailId,
    license: license,
    role: role,
    transactions: [],
    approved: false,
  };
  const insertInfo = await entityData.insertOne(newEntity);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw "Could not add the entity!";
  const newId = insertInfo.insertedId.toString();
  const newOne = await this.getEntityById(newId);
  return newOne;
};

const getAllEntities = async () => {
  const client = getClient();
  const entityData = client.collection(entityCollection);
  let entityList = await entityData.find({}).toArray();
  if (!entityList) throw "Could not get all entities!";
  entityList = entityList.map((element) => {
    element._id = element._id.toString();
    return element;
  });
  return entityList;
};

const getEntityById = async (id) => {
  if (!id) throw `Recheck your inputs, one or more inputs are missing!`;
  if (!ObjectId.isValid(id)) throw `Invalid entity id inputted!`;

  const client = getClient();
  const entityData = client.collection(entityCollection);
  let meh = await entityData.findOne({ _id: new ObjectId(id) });
  if (meh === null) throw `No entity with given email address!`;
  meh._id = meh._id.toString();
  return meh;
};

const updateEntity = async (emailId) => {};

const getTransactionsByEntityId = async (id) => {
  // Change validations, func name, new object
  if (!id) throw `Recheck your inputs, one or more inputs are missing!`;
  if (!ObjectId.isValid(id)) throw `Invalid entity id inputted!`;

  const client = getClient();
  const entityData = client.collection(entityCollection);
  let meh = await entityData.findOne({ _id: new ObjectId(id) });
  if (meh === null) throw `No entity with given id!`;

  const trans = meh.transactions;
  if (trans.length === 0) throw `No transaction has been alloted to you yet!`;

  return trans;
};

const entityApproved = async (id, role) => {
  if (!id || !role)
    throw `Recheck your inputs, one or more inputs are missing!`;
  if (!ObjectId.isValid(id)) throw `Invalid transaction ObjectId inputted!`;
  role = role.toLowerCase();
  if (
    role !== "land surveyor" &&
    role !== "title company" &&
    role !== "government"
  )
    throw `Invalid role!`;

  const client = getClient();
  const transaction = await client
    .collection(transacsCollection)
    .findOne({ _id: new ObjectId(id) });
  if (transaction === null) throw `No transaction with given ID found!`;

  let result = undefined;
  if (role === "land surveyor") {
    result = await client
      .collection(transacsCollection)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { "surveyor.status": true } },
        { returnDocument: "after" }
      );
  } else if (role === "title company") {
    result = await client
      .collection(transacsCollection)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { "titleCompany.status": true } },
        { returnDocument: "after" }
      );
  } else if (role === "government") {
    result = await client
      .collection(transacsCollection)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { "government.status": true } },
        { returnDocument: "after" }
      );
  }
  if (result.lastErrorObject.n < 1) {
    throw `Transaction with id ${id} could not be approved!`;
  }
  return result;
};

const entityTerminateTransaction = async (id, comment, role) => {
  if (!id || !comment || !role)
    throw `Recheck your inputs, one or more inputs are missing!`;
  if (!ObjectId.isValid(id)) throw `Invalid transaction ObjectId inputted!`;
  if (typeof comment !== "string") throw `Comment must be a string!`;
  if (comment.trim().length === 0)
    throw `Comment box cannot be empty or just spaces!`;
  comment = comment.trim();
  role = role.toLowerCase();
  if (
    role !== "land surveyor" &&
    role !== "title company" &&
    role !== "government"
  )
    throw `Invalid role!`;

  const client = getClient();
  const transaction = await client
    .collection(transacsCollection)
    .findOne({ _id: new ObjectId(id) });
  if (transaction === null) throw `No transaction with given ID found!`;
  let result = undefined;
  if (role === "land surveyor") {
    result = await client.collection(transacsCollection).findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          "surveyor.status": false,
          "surveyor.Comment": comment,
          status: "rejected",
        },
      },
      { returnDocument: "after" }
    );
  } else if (role === "title company") {
    result = await client.collection(transacsCollection).findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          "titleCompany.status": false,
          "titleCompany.Comment": comment,
          status: "rejected",
        },
      },
      { returnDocument: "after" }
    );
  } else if (role === "government") {
    result = await client.collection(transacsCollection).findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          "government.status": false,
          "government.Comment": comment,
          status: "rejected",
        },
      },
      { returnDocument: "after" }
    );
  }

  if (result.lastErrorObject.n < 1) {
    throw `Transaction with id ${id} could not be terminated!`;
  }
  return result;
};

const filterByStatus = async (id) => {
  // Change validations
  if (!id) throw `Recheck your inputs, one or more inputs are missing!`;
  if (!ObjectId.isValid(id)) throw `Invalid transaction ObjectId inputted!`;

  const transactions = await this.getTransactionsByEntityId(id);
  const entity = await this.getEntityById(id);
  let result = [];
  for (let i = 0; i < transactions.length; i++) {
    if (entity.role === "land surveyor") {
      if (
        transactions[i].status.toLowerCase() === "pending" &&
        transactions[i].surveyor.status === false
      ) {
        result.push(transactions[i]);
      }
    } else if (entity.role === "title company") {
      if (
        transactions[i].status.toLowerCase() === "pending" &&
        transactions[i].titleCompany.status === false
      ) {
        result.push(transactions[i]);
      }
    } else if (entity.role === "government") {
      if (
        transactions[i].status.toLowerCase() === "pending" &&
        transactions[i].government.status === false
      ) {
        result.push(transactions[i]);
      }
    }
  }

  if (result.length === 0) throw `No pending transaction exists!`;
  return result;
};

const assignEntity = async (id, role) => {
  if (!id) throw `Recheck your inputs, one or more inputs are missing!`;
  if (!ObjectId.isValid(id)) throw `Invalid transaction ObjectId inputted!`;
  role = role.toLowerCase();
  if (
    role !== "land surveyor" &&
    role !== "title company" &&
    role !== "government"
  )
    throw `Invalid role!`;

  const transaction = await client
    .collection(transacsCollection)
    .findOne({ _id: id });
  if (transaction === null) throw `No transaction with given ID found!`;
  const client = await getClient();
  const entityData = client.collection(entityCollection);

  if (transaction.sellersStatus === true) {
    let meh = await entityData.find({ role: role, approval: true }).toArray();
    const random = Math.floor(Math.random() * meh.length + 1);
    for (let i = 0; i < meh.length; i++) {
      if (meh[random].transactions.length === 25 && random < meh.length) {
        random = random + 1;
      } else if (
        meh[random].transactions.length === 25 &&
        random > meh.length
      ) {
        random = 0;
      } else if (meh[random].transactions.length < 25 && random < meh.length) {
        if (role === "land surveyor") {
          transaction.surveyor._id = meh._id;
        } else if (role === "title company") {
          transaction.titleCompany._id = meh._id;
        } else if (role === "government") {
          transaction.government._id = meh._id;
        }
        break;
      }
    }
  } else {
    throw `This transaction has all entities assigned!`;
  }
};

const pendingTransactionsCount = async (id) => {
  const transactions = await this.filterByStatus(id);
  return transactions.length;
};

const totalTransactionsCount = async (id) => {
  const transactions = await this.getTransactionsByEntityId(id);
  return transactions.length;
};

const entityData = {
  addNewEntity,
  getAllEntities,
  getEntityById,
  updateEntity,
  getTransactionsByEntityId,
  entityApproved,
  entityTerminateTransaction,
  filterByStatus,
  assignEntity,
  pendingTransactionsCount,
  totalTransactionsCount,
};

export default entityData;
