import validation from "../utils/validation.js";
import { getClient } from "../config/connection.js";
import { arrayLength, checkInputType, exists } from "../utils/helpers.js";
import { ObjectId } from "mongodb";
import hash from "../utils/encryption.js";

const getOwnerByLandId = async (id) => {
  if (!exists(id)) throw new Error("ID parameter does not exist");
  if (!checkInputType(id, "string"))
    throw new Error("ID must be of type string only");
  if (id.trim().length === 0)
    throw new Error("ID cannot contain empty spaces only");
  id = id.trim();
  if (!ObjectId.isValid(id)) throw new Error("Invalid object id");
  const client = getClient();
  const result = await client
    .collection("users")
    .findOne({ "land._id": new ObjectId(id) });
  if (result === null) throw new Error("No user found for this Land ID");
  result._id = result._id.toString();
  return result;
};

const getUserByEmail = async (email) => {
  email = validation.validEmail(email);
  const client = getClient();
  let result = await client.collection("users").findOne({ emailId: email });
  if(result == null) throw "User not found";
  return result._id.toString();
};

const updateUserData = async (email, name, phone, dob, gender) => {};

const getUserById = async (id) => {
  if (!exists(id)) throw new Error("ID parameter does not exist");
  if (!checkInputType(id, "string"))
    throw new Error("ID must be of type string only");
  if (id.trim().length === 0)
    throw new Error("ID cannot contain empty spaces only");
  id = id.trim();
  if (!ObjectId.isValid(id)) throw new Error("Invalid object id");
  const client = getClient();
  const result = await client
    .collection("users")
    .findOne({ _id: new ObjectId(id) });
  if (result === null) throw new Error("No user found with such ID");
  result._id = result._id.toString();
  return result;
};

const createUser = async (
  name,
  phone, //TODO: Discuss whether this will be a string or a number (STRING)
  emailId,
  govtIdType,
  govtIdNumber,
  dob,
  gender
) => {
  // Validate input
  name = validation.validString(name);
  phone = validation.validNumber(phone);
  emailId = validation.validEmail(emailId);
  govtIdType = validation.validString(govtIdType);
  govtIdNumber = validation.validString(govtIdNumber);
  dob = validation.validDOB(dob);
  gender = validation.validGender(gender);

  const govtIdHashed = govtIdNumber; //TODO: Gotta hash this (BCRYPT)

  // Initialize
  let newUser = {
    name: name,
    phone: phone,
    emailId: emailId,
    governmentId: {
      typeofId: govtIdType,
      id: govtIdHashed,
    },
    dob: dob,
    gender: gender,
    approved: false,
    rating: {
      totalRating: 0,
      noOfRating: 0,
    },
    land: [],
  };
  // Insert user into database
  const client = getClient();
  const result = await client.collection("users").insertOne(newUser);//TODO: change to update function;

  if (!result.ackowledged || !result.insertedId) throw `failed to insert user`;

  const newId = result.insertedId.toString();
  const user = await getUserById(newId);
  return user;
};

const getLandsOfUserID = async (id) => {
  if (!exists(id)) throw new Error("ID parameter does not exists");
  if (!checkInputType(id, "string"))
    throw new Error("ID must be of string only");
  if (id.trim().length === 0) throw new Error("ID cannot be of empty spaces");
  id = id.trim();
  if (!ObjectId.isValid(id)) throw new Error("Invalid Object ID");

  const client = getClient();
  const result = await client
    .collection("users")
    .find({ _id: new ObjectId(id) })
    .project({ land: 1 })
    .toArray();
  let landIds = [];
  result[0].land.forEach((element) => {
    landIds.push(element._id);
  });
  if (!arrayLength(landIds, 1)) return [];
  const lands = await client
    .collection("land")
    .find({ _id: { $in: landIds } })
    .toArray();
  return lands;
};

const initializeProfile = async(email)=>{
  email = validation.validEmail(email);
  let newUser = {
      name: "",
      phone: "",
      emailId: email,
      governmentId: {
        typeofId: "",
        id: "",
      },
      dob: "",
      gender: "",
      approved: false,
      rating: {
        totalRating: 0,
        noOfRating: 0,
      },
      land: [],
    };

  const client = getClient();

  //if email already being used
  try {
    const isPresent = await getUserByEmail(email);
    throw "Email already exist, please login."
  } catch (error) {
  }

  //initializing user
  const result = await client.collection("users").insertOne(newUser);

  console.log(result);
  if (!result.ackowledged || !result.insertedId) {throw `failed to insert user`};
  
  return true;
}

const userData = {
  getOwnerByLandId: getOwnerByLandId,
  getUserByEmail: getUserByEmail,
  updateUserData: updateUserData,
  getUserById: getUserById,
  createUser: createUser,
  getLandsOfUserID: getLandsOfUserID,
  initializeProfile:initializeProfile
};

export default userData;
