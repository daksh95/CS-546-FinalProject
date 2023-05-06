import { ObjectId } from "mongodb";
import { getClient } from "../config/connection.js";
import { entityCollection, transacsCollection } from "./collectionNames.js";
import validation from "../utils/validation.js";

const addNewEntity = async (
  name,
  role,
  contactInfo,
  emailId,
  Website,
  license
) => {
  if (!name || !contactInfo || !emailId || !Website || !license || !role)
    throw `Recheck your inputs, one or more inputs are missing!`;

  if (typeof name !== "string") throw `Entity name must be a string!`;
  if (name.trim().length === 0)
    throw `Entity name cannot be an empty string or just spaces!`;
  name = name.trim();

  if (typeof contactInfo !== "number") throw `Contact number must be a number!`;
  let numStr = contactInfo.toString();
  if (numStr.length !== 10) throw `Input a valid 10-digit contact number!`;

  if (typeof emailId !== "string") throw `Email address must be a string!`;
  if (emailId.trim().length === 0)
    throw `Email address cannot be an empty string or just spaces!`;
  let bleh = /^[^s@]+@[^s@]+.[^s@]+$/;
  if (!bleh.test(emailId)) throw `Invalid email address!`;
  emailId = emailId.trim().toLowerCase();

  if (typeof Website !== "string") throw `Band website must be a string!`;
  if (website.trim().length === 0)
    throw `Band website cannot be an empty string or just spaces!`;
  if (
    !Website.includes("http://www.") ||
    !Website.includes(".com") ||
    Website.trim().length < 17
  )
    throw `Invalid entity website!`;
  Website = Website.trim();

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
    role: role,
    contactInfo: contactInfo,
    emailId: emailId,
    Website: Website,
    license: license,
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

const getEntityByEmail = async (emailInput) => {
  let email = validation.validEmail(emailInput);
  const client = getClient();
  const result = await client.collection("entity").findOne({ emailId: email });
  return result;
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
        { $set: { "surveyor.status": "approved" } },
        { returnDocument: "after" }
      );
  } else if (role === "title company") {
    result = await client
      .collection(transacsCollection)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { "titleCompany.status": "approved" } },
        { returnDocument: "after" }
      );
  } else if (role === "government") {
    result = await client
      .collection(transacsCollection)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { "government.status": "approved" } },
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
          "surveyor.status": "rejected",
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
          "titleCompany.status": "rejected",
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
          "government.status": "rejected",
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

const pendingTransactionsByEntityId = async (id) => {
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
        transactions[i].surveyor.status === "pending"
      ) {
        result.push(transactions[i]);
      }
    } else if (entity.role === "title company") {
      if (
        transactions[i].status.toLowerCase() === "pending" &&
        transactions[i].titleCompany.status === "pending"
      ) {
        result.push(transactions[i]);
      }
    } else if (entity.role === "government") {
      if (
        transactions[i].status.toLowerCase() === "pending" &&
        transactions[i].government.status === "pending"
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

  const client = await getClient();
  const transaction = await client
    .collection(transacsCollection)
    .findOne({ _id: id });
  if (transaction === null) throw `No transaction with given ID found!`;
  
  const entityData = client.collection(entityCollection);

  if (transaction.seller.status === "approved") {
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
          return meh._id.toString();
        } else if (role === "title company") {
          return meh._id.toString();
        } else if (role === "government") {
          return meh._id.toString();
        }
        break;
      }
    }
  } else {
    throw `This transaction has all entities assigned!`;
  }
};

const pendingTransactionsCount = async (id) => {
  const transactions = await this.pendingTransactionsByEntityId(id);
  return transactions.length;
};

const totalTransactionsCount = async (id) => {
  const transactions = await this.getTransactionsByEntityId(id);
  return transactions.length;
};


const initializeEntityProfile = async (email, role)=>{
  email = validation.validEmail(email);
  role = validation.validTypeOfUser(role);

  let newEntity = {
    name: "",
    role: role,
    contactInfo: "",
    emailId: email,
    Website: "",
    license: "",
    transactions: [],
    approved: false,
  };

  const client = getClient();
  let result = await client.collection(entityCollection).insertOne(newEntity);
  if (!result.acknowledged || !result.insertedId) throw "Could not add the entity!";
  return true;
}

const entityData = {
  addNewEntity,
  getAllEntities,
  getEntityById,
  updateEntity,
  getTransactionsByEntityId,
  entityApproved,
  entityTerminateTransaction,
  pendingTransactionsByEntityId,
  assignEntity,
  pendingTransactionsCount,
  totalTransactionsCount,
  getEntityByEmail,
  initializeEntityProfile
};

export default entityData;
