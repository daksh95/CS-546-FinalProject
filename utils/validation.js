import { ObjectId } from "mongodb";
import moment from "moment";
import zip_lookup from "../constants/zip_lookup.js";
import { compare } from "bcrypt";

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
    throw `Valid email id needed`;
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

const validLandType = (type)=>{
  type = validString(type, "Type of Land");
        if(type != "residential" && type!= "commercial" && type != "industrial" && type != "agricultural"){
            throw  `Valid Land Type is needed`;
        }
    return type;
}

const validZip= (zip, state, city)=>{
  zip = validString(zip, "zipCode");
  const numbersOnly = /^[0-9]+$/g;
  if(!numbersOnly.test(zip)){
      throw `valid zipcode is needed`;
  }
  // zip = parseInt(zip);
  state = validState(state); 
  city = validString(city, "City", 30);
  const zipLookUp = zip_lookup;
  for(let zipKey of Object.keys(zipLookUp)){
    if(zip == zipKey){

        if(zipLookUp[zipKey]["state"].toUpperCase() == state.toUpperCase()){

          if(zipLookUp[zipKey]["city"].toLowerCase() == city.toLowerCase()){
            return zip;
          }else{
            throw 'city and zip do not match';
          }
        }else{
          throw 'city and state do not match';
        }
    }
  }
  throw 'please provide valid Zip Code';
}
const validGovernmentIdType =(governmentIdType)=>{
  governmentIdType = validString(governmentIdType, "Government ID Type");
  if(governmentIdType != "ssn" && governmentIdType != "driverLicense"){
      throw "Not a valid government id type";
  }
  return governmentIdType;
}

const validDob = (dob) =>{
  dob = validString(dob, "Date of Birth");
  const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateFormat.test(dob)) {
      throw "Proper date formated is needed";
  } 
  let dateArry = dob.split("-");
  let excact18 = false;

  //minus years
  if(parseInt(dateArry[0]) + 18 > new Date().getFullYear()){
      throw 'User should be between 18 and 110 years old';    
  }
  if(parseInt(dateArry[0]) + 18 == new Date().getFullYear()){

      excact18= true;
  }
  if(new Date().getFullYear() - parseInt(dateArry[0]) >110 ){
      throw 'User should be between 18 and 110 years old';
  }
  //month check and date check
  if(excact18){

      if(parseInt(dateArry[1]) > new Date().getMonth()+1){
          throw "User should be between 18 and 110 years old";
      }


      if(parseInt(dateArry[2]) > new Date().getDate()){//edge case, leap year.
          throw "User should be between 18 and 110 years old";
      } 
  }
  return dob;
}

const validSSN = (ssn)=>{
  ssn = validString(ssn, "SSN number", 11);
  let ssnFormat = /^\d{3}-\d{2}-\d{4}$/g;
  if(!ssn.match(ssnFormat)){
      throw `please provide valid ssn with "-" in between`;
  }
  return ssn;
}

const validState= (state)=>{
  const validStateCodes = [
       "AL",
       "AK",
       "AZ",
       "AR",
       "CA",
       "CO",
       "CT",
       "DE",
       "FL",
       "GA",
       "HI",
       "ID",
       "IL",
       "IN",
       "IA",
       "KS",
       "KY",
       "LA",
       "ME",
       "MD",
       "MA",
       "MI",
       "MN",
       "MS",
       "MO",
       "MT",
       "NE",
       "NV",
       "NH",
       "NJ",
       "NM",
       "NY",
       "NC",
       "ND",
       "OH",
       "OK",
       "OR",
       "PA",
       "RI",
       "SC",
       "SD",
       "TN",
       "TX",
       "UT",
       "VT",
       "VA",
       "WA",
       "WV",
       "WI",
       "WY",
     ];
    state = validString(state, "State",2);
    state = state.toUpperCase();
    if(!validStateCodes.includes(state)){
       throw `please provide valid state`;
    } 
    return state;
}

const validDriverLicense = (driverLicense)=>{
  driverLicense = validString(driverLicense, "Driver's License", 20);
  let onlyAlphaNumeric = /[a-zA-Z0-9]{1,20}$/g;
  if(!onlyAlphaNumeric.test(driverLicense)){
      throw `please provide valid drivers license`;
  }
  let oneSpecial = /[^a-zA-Z0-9\s]/g;
  let whiteSpace = /.*[\s].*/g;
  if (driverLicense.match(whiteSpace)) {
    throw `Driver's License should not contain any spaces`;
  }
  if (driverLicense.match(oneSpecial)) {
      throw `Driver's License must not have special character(s)`;
    }
  return driverLicense;
}

const validPhone = (phone)=>{
  phone = validString(phone, "Phone Number", 10);
  
  let numberOnly = /^[0-9]{8,11}$/g;
  if(!numberOnly.test(phone)){
      throw `Length phone number should between 8 to 10 numebrs`; 
  }
  return phone;
}  

const validName=(name)=>{
    name = validString(name, "name", 126);
    const nameFormat = /^[a-zA-Z0-9.\s]+$/g;
    if(!nameFormat.test(name)){
      throw `Name can only have alphanumeric, '.' and whitespace in between`;
    }
    return name;
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
  validApprovalStatus: validApprovalStatus,
  validLandType:validLandType,
  validZip: validZip,
  validState:validState,
  validDob: validDob,
  validSSN: validSSN,
  validDriverLicense:validDriverLicense,
  validPhone: validPhone,
  validGovernmentIdType:validGovernmentIdType,
  validName:validName,
};

export default validation;
