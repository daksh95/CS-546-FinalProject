import { ObjectId } from "mongodb";
import { getClient } from "../config/connection.js";
import { entity, transacs } from "./data/collectionNames.js";
import bcrypt from "bcrypt";
const saltRounds = 16;

const exportedMethods = {
  // const addNewEntity =
  async addNewEntity(
    name,
    contactNumber,
    emailId,
    govtIdType,
    govtIdNumber,
    role
  ) {
    if (
      !name ||
      !contactNumber ||
      !emailId ||
      !govtIdType ||
      !govtIdNumber ||
      !role
    )
      throw `Recheck your inputs, one or more inputs are missing!`;

    if (typeof name !== "string") throw `Entity name must be a string!`;
    if (name.trim().length === 0)
      throw `Entity name cannot be an empty string or just spaces!`;
    name = name.trim();

    if (typeof contactNumber !== "number")
      throw `Contact number must be a number!`;
    let numStr = contactNumber.toString();
    if (numStr.length < 10) throw `Input a valid 10-digit contact number!`;

    if (typeof emailId !== "string") throw `Email address must be a string!`;
    if (emailId.trim().length === 0)
      throw `Email address cannot be an empty string or just spaces!`;
    let bleh = /^[^s@]+@[^s@]+.[^s@]+$/;
    if (!bleh.test(emailId)) throw `Invalid email address!`;
    emailId = emailId.trim().toLowerCase();

    govtIdType = govtIdType.toLowerCase();
    if (
      govtIdType !== "ssn" &&
      govtIdType !== "stateid" &&
      govtIdType !== "driversid"
    )
      throw `Invalid government ID type!`;

    if (govtIdType === "ssn") {
      if (govtIdNumber.length !== 9)
        throw `Input a valid 9-digit social security number!`;
    } else {
      if (typeof govtIdNumber !== "string")
        throw `Government ID number must be a string!`;
      if (govtIdNumber.trim().length === 0)
        throw `Government ID number cannot be an empty string or just spaces!`;
      govtIdNumber = govtIdNumber.trim();
    }

    role = role.toLowerCase();
    if (
      role !== "admin" &&
      role !== "user" &&
      role !== "land surveyor" &&
      role !== "title company" &&
      role !== "government"
    )
      throw `Invalid role!`;

    const govtIdHashed = await bcrypt.hash(govtIdNumber, saltRounds);

    const client = getClient();
    const entityCollection = client.collection(entity);
    let meh = await entityCollection.findOne({ emailId: emailId });
    if (meh !== null) throw `Email address already in use!`;

    let newEntity = {
      name: name,
      contactNumber: contactNumber,
      emailId: emailId,
      govtIdType: govtIdType,
      govtIdNumber: govtIdHashed,
      role: role,
      transactions: [],
    };
    const insertInfo = await entityCollection.insertOne(newEntity);
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
      throw "Could not add the entity!";
    const newOne = await this.get(emailId);
    return newOne;
  },

  // const getAllEntities =
  async getAllEntities() {
    const client = getClient();
    const entityCollection = client.collection(entity);
    let entityList = await entityCollection.find({}).toArray();
    if (!entityList) throw "Could not get all entities!";
    entityList = entityList.map((element) => {
      element._id = element._id.toString();
      return element;
    });
    return entityList;
  },

  async get(emailAddress) {
    if (!emailAddress) throw `Recheck your input, no email address inputted!!`;
    if (typeof emailAddress !== "string")
      throw `Email address must be a string!`;
    if (emailAddress.trim().length === 0)
      throw `Email address cannot be an empty string or just spaces!`;
    let bleh = /^[^s@]+@[^s@]+.[^s@]+$/;
    if (!bleh.test(emailAddress)) throw `Invalid email address!`;
    emailAddress = emailAddress.trim().toLowerCase();

    const client = getClient();
    const entityCollection = client.collection(entity);
    let meh = await entityCollection.findOne({ emailId: emailAddress });
    if (meh === null) throw `No entity with given email address!`;
    meh._id = meh._id.toString();
    return meh;
  },

  async updateEntity(emailId) {},

  async getTransactionsByEntityEmail(emailId) {
    if (!emailId) throw `Recheck your input, no email address inputted!`;
    if (typeof emailId !== "string") throw `Email address must be a string!`;
    if (emailId.trim().length === 0)
      throw `Email address cannot be an empty string or just spaces!`;
    let bleh = /^[^s@]+@[^s@]+.[^s@]+$/;
    if (!bleh.test(emailId)) throw `Invalid email address!`;
    emailId = emailId.trim().toLowerCase();

    const client = getClient();
    const entityCollection = client.collection(entity);
    let meh = await entityCollection.findOne({ emailId: emailId });
    if (meh === null) throw `No entity with given email address!`;

    const trans = meh.transactions;
    if (trans.length === 0) throw `No transaction has been alloted to you yet!`;

    return trans;
  },

  async entityApproved(id, role) {
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
    const transaction = await client.collection(transacs).findOne({ _id: id });
    if (transaction === null) throw `No transaction with given ID found!`;
    let result = undefined;
    if (role === "land surveyor") {
      result = await client
        .collection(transacs)
        .findOneAndUpdate(
          { _id: id },
          { $set: { surveyorApproval: true } },
          { returnDocument: "after" }
        );
    } else if (role === "title company") {
      result = await client
        .collection(transacs)
        .findOneAndUpdate(
          { _id: id },
          { $set: { titleCompanyApproval: true } },
          { returnDocument: "after" }
        );
    } else if (role === "government") {
      result = await client
        .collection(transacs)
        .findOneAndUpdate(
          { _id: id },
          { $set: { governmentApproval: true } },
          { returnDocument: "after" }
        );
    }
    if (result.lastErrorObject.n < 1) {
      throw `Transaction with id ${id} could not be approved!`;
    }
    return result;
  },

  async entityTerminateTransaction(id, comment, role) {
    if (!emailId || !comment || !role)
      throw `Recheck your inputs, one or more inputs are missing!`;
    if (!ObjectId.isValid(id)) throw `Invalid transaction ObjectId inputted!`;
    if (typeof comment !== "string") throw `Comment must be a string!`;
    if (comment.length > 0 && comment.trim().length === 0)
      throw `Comment cannot be just spaces!`;
    comment = comment.trim();
    role = role.toLowerCase();
    if (
      role !== "land surveyor" &&
      role !== "title company" &&
      role !== "government"
    )
      throw `Invalid role!`;

    const client = getClient();
    const transaction = await client.collection(transacs).findOne({ _id: id });
    if (transaction === null) throw `No transaction with given ID found!`;
    let result = undefined;
    if (role === "land surveyor") {
      result = await client
        .collection(transacs)
        .findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: { surveyorApproval: false, surveyorComment: comment } },
          { returnDocument: "after" }
        );
    } else if (role === "title company") {
      result = await client.collection(transacs).findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: { titleCompanyApproval: false, titleCompanyComment: comment },
        },
        { returnDocument: "after" }
      );
    } else if (role === "government") {
      result = await client
        .collection(transacs)
        .findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: { governmentApproval: false, governmentcomment: comment } },
          { returnDocument: "after" }
        );
    }
    if (result.lastErrorObject.n < 1) {
      throw `Transaction with id ${id} could not be terminated!`;
    }
    return result;
  },

  async filterByStatus(emailId) {
    if (!emailId) throw `Recheck your input, no email address inputted!`;
    if (typeof emailId !== "string") throw `Email address must be a string!`;
    if (emailId.trim().length === 0)
      throw `Email address cannot be an empty string or just spaces!`;
    let bleh = /^[^s@]+@[^s@]+.[^s@]+$/;
    if (!bleh.test(emailId)) throw `Invalid email address!`;
    emailId = emailId.trim().toLowerCase();

    const transactions = await this.getTransactionsByEntityEmail(emailId);
    let result = [];
    for (let i = 0; i < transactions.length; i++) {
      if (transactions[i].status.toLowerCase() === "pending") {
        result.push(transactions[i]);
      }
    }
    if (result.length === 0) throw `No pending transaction exists!`;
    return result;
  },

  async assignEntity(id, role) {
    if (!id) throw `Recheck your inputs, one or more inputs are missing!`;
    if (!ObjectId.isValid(id)) throw `Invalid transaction ObjectId inputted!`;
    role = role.toLowerCase();
    if (
      role !== "land surveyor" &&
      role !== "title company" &&
      role !== "government"
    )
      throw `Invalid role!`;

    const transaction = await client.collection(transacs).findOne({ _id: id });
    if (transaction === null) throw `No transaction with given ID found!`;
    const client = await getClient();
    const entityCollection = client.collection(entity);

    if (transaction.surveyorId === null) {
      let meh = await entityCollection
        .find({ role: "land surveyor" })
        .toArray();
      const random = Math.floor(Math.random() * meh.length + 1);
      for (let i = 0; i < meh.length; i++) {
        if (meh[random].transactions.length === 25 && random < meh.length) {
          random = random + 1;
        } else if (
          meh[random].transactions.length === 25 &&
          random > meh.length
        ) {
          random = 0;
        } else if (
          meh[random].transactions.length < 25 &&
          random < meh.length
        ) {
          transaction.surveyorId = meh.id;
          break;
        }
      }
    } else if (transaction.titleCompanyId === null) {
      let meh = await entityCollection
        .find({ role: "title company" })
        .toArray();
      const random = Math.floor(Math.random() * meh.length + 1);
      for (let i = 0; i < meh.length; i++) {
        if (meh[random].transactions.length === 25 && random < meh.length) {
          random = random + 1;
        } else if (
          meh[random].transactions.length === 25 &&
          random > meh.length
        ) {
          random = 0;
        } else if (
          meh[random].transactions.length < 25 &&
          random < meh.length
        ) {
          transaction.surveyorId = meh.id;
          break;
        }
      }
    } else if (transaction.governmentId === null) {
      let meh = await entityCollection.find({ role: "government" }).toArray();
      const random = Math.floor(Math.random() * meh.length + 1);
      for (let i = 0; i < meh.length; i++) {
        if (meh[random].transactions.length === 25 && random < meh.length) {
          random = random + 1;
        } else if (
          meh[random].transactions.length === 25 &&
          random > meh.length
        ) {
          random = 0;
        } else if (
          meh[random].transactions.length < 25 &&
          random < meh.length
        ) {
          transaction.surveyorId = meh.id;
          break;
        }
      }
    } else {
      throw `This transaction has all entities assigned!`;
    }
  },
};

export default exportedMethods;
