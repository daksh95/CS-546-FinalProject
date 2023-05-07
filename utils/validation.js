import { MinKey, ObjectId } from "mongodb";
import { isValidObjectId } from "mongoose";
import moment from "moment";

const validString = (string, parameter = "input", maxLength = null) => {
  if (string === undefined || !string || typeof string !== "string")
    throw `${parameter} does not exist or is not a string`;

  string = string.trim();
  if (string.length == 0)
    throw `${parameter} cannot be an empty string or just spaces`;

  if (maxLength) {
    if (string.length > maxLength) {
      throw `${parameter} can be only ${maxLength} character long`;
    }
  }
  return string;
};

const validObjectId = (id, parameter = "input") => {
  id = validString(id, parameter);
  if (!ObjectId.isValid(id)) throw `Valid ObjectId required for ${parameter}`;
  return id;
};

//this is for string arrays
const validArrayOfStrings = (array, parameter = "input") => {
  if (!array || !Array.isArray(array)) throw `${parameter} is not an array`;
  const arr = [];
  for (let i in array) {
    if (array[i] === undefined || !array[i] || typeof array[i] !== "string")
      throw `One or more elements in ${parameter} array is not a string`;
    array[i] = array[i].trim();
    if (array[i].length === 0)
      throw `One or more elements in ${parameter} array is an empty string`;
    arr.push(array[i]);
  }
  if (arr.length === 0) throw `${parameter} is an empty array`;
  return arr;
};

const validNumber = (num, parameter = "input", min = null, max = null) => {
  if (typeof num == "undefined") {
    throw `${parameter} should be provided`;
  }
  if (typeof num != "number") {
    throw ` number is needed but "${typeof num}" was provided for ${parameter}`;
  }
  if (Number.isNaN(num)) {
    throw `Valid number required for ${parameter}`;
  }
  if (min) {
    if (num < min) {
      throw `${parameter} can must be greater than ${min}`;
    }
  }
  if (max) {
    if (num > max) {
      throw `${parameter} can must be less than ${max}`;
    }
  }
  return num;
};

const validWebsite = (website) => {
  website = validString(website);
  const regex = new RegExp(/^http:\/\/www\.[\w\W]{5,}\.com$/i);
  if (!regex.test(website)) {
    throw `Valid website URL needed ${website}`;
  }
  return website;
};

const validEmail = (email) => {
  email = validString(email, "email");
  const regex = new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
  if (!regex.test(email)) {
    throw `Valid email id needed ${email}`;
  }

  return email.toLowerCase();
};

const validDOB = (dob, parameter = "DOB") => {
  dob = validString(dob, parameter);
  if (!moment(dob, "MM/DD/YYYY", false).isValid())
    throw `${parameter}: ${dob} is not a valid date format`;

  const dobDate = moment(dob, "MM/DD/YYYY");
  const age = moment().diff(dobDate, "years");
  if (age < 18 || user > 110) throw `User should be between 18 and 110 years old in order to register`;
  return dob;
};

const validGenders = ["male", "female", "other"];

const validGender = (gender, parameter = "gender") => {
  gender = validString(gender, parameter).toLowerCase();
  if (!validGenders.includes(gender))
    throw `${gender} is not a recognized gender`;
  return gender;
};

const validPhoneNumber = (phone, parameter = "phone") => {};

const validBool = (bool, parameter = "input") => {
  if (typeof bool == "undefined") {
    throw `${parameter} is required`;
  }
  if (typeof bool != "boolean") {
    throw `${parameter} should be a true or false`;
  }
};

const validPassword = (pass) => {
  pass = validString(pass, "password", 15);
  if (pass.length < 8) {
    throw `Password length should be a minimum of 8`;
  }
  let upperCase = /.*[A-Z].*/g;
  let oneNumber = /.*[0-9].*/g;
  let oneSpecial = /[^a-zA-Z0-9\s]/g;
  let whiteSpace = /.*[\s].*/g;
  if (pass.match(whiteSpace)) {
    throw `Password should not contain any spaces`;
  }
  if (!pass.match(upperCase)) {
    throw `Password should have atleast one upercase character`;
  }
  if (!pass.match(oneNumber)) {
    throw `Password should have atleast one number`;
  }
  if (!pass.match(oneSpecial)) {
    throw `Password should have atleast one special character`;
  }
  return pass;
};

const validTypeOfUser = (user) => {
  user = validString(user, "type of user", 16);
  user = user.toLowerCase();
  if (
    user !== "admin" &&
    user !== "titlecompany" &&
    user !== "government" &&
    user !== "user" &&
    user !== "landsurveyor"
  ) {
    throw `Please select correct type of user`;
  }
  return user;
};

const validApprovalStatus = (status, parameter = 'status') => {
  status = validString(status, parameter);
  status = status.toLowerCase();

  const validStatus = ['pending', 'approved', 'rejected'];
  if (!validStatus.includes(status)) throw 'Invalid approval status';
  return status;
}

const validation = {
  validString: validString,
  validArrayOfStrings: validArrayOfStrings,
  validWebsite: validWebsite,
  validNumber: validNumber,
  validObjectId: validObjectId,
  validEmail: validEmail,
  validDOB: validDOB,
  validGender: validGender,
  validBool: validBool,
  validPassword: validPassword,
  validTypeOfUser: validTypeOfUser,
  validApprovalStatus: validApprovalStatus
};

export default validation;
