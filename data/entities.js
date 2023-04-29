import { entity } from "../config/mongoCollections.js";
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

    const entityCollection = await entity();
    let meh = await entityCollection.findOne({ emailId: emailId });
    if (meh !== null) throw `Email address already in use!`;

    let newEntity = {
      name: name,
      contactNumber: contactNumber,
      emailId: emailId,
      govtIdType: govtIdType,
      govtIdNumber: govtIdHashed,
      role: role,
    };
    const insertInfo = await entityCollection.insertOne(newEntity);
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
      throw "Could not add the entity!";
    const newOne = await this.get(emailId);
    return newOne;
  },

  // const getAllEntities =
  async getAllEntities() {
    const entityCollection = await entity();
    let entityList = await entityCollection.find({}).toArray();
    if (!entityList) throw "Could not get all entities!";
    entityList = entityList.map((element) => {
      element._id = element._id.toString();
      return element;
    });
    return entityList;
  },

  async get(emailAddress) {
    let entityCollection = await entity();
    let meh = await entityCollection.findOne({ emailId: emailAddress });
    if (meh === null) throw `No entity with given email address!`;
    meh._id = meh._id.toString();
    return meh;
  },

  async updateEntity(emailId) {},
};

export default exportedMethods;
