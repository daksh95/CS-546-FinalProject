import { ObjectId } from "mongodb";
import { isValidObjectId } from "mongoose";

const validString = (string, parameter) => {
    if(typeof string == 'undefined'){
      throw `${parameter} should be provided`;   
    }
    if(typeof string != 'string'){
        throw `String is needed but "${typeof string}" was provided for ${parameter}`;
    }
    if(string.length == 0){
        throw `Input shouldn't be an empty string for ${parameter}`;
    }
    if(string.trim().length <1){
        throw ` Input shouldn't be a string with just spaces for ${parameter}`;
    }
}

//this is for string arrays
const validArray = (array, parameter) => {

    if(typeof array == "undefined"){
        throw `${parameter} should be provided`;
    }

    if(!Array.isArray(array)){
        throw `${parameter} should be a valid array`;
    }
    else if(array.length<1){
          throw `There should be atleast one element in ${parameter}`;
    } 
    for(let arr of array){
        try {
            validString(arr, parameter);
        } catch (error) {
            throw `Each element in ${parameter} should be a valid string`
        }
    }
}

const validNumber =(num, parameter) => {
    if(typeof num == "undefined"){
        throw `${parameter} should be provided`;
    }
    if(typeof num != "number" ){
        throw ` number is needed but "${typeof num}" was provided for ${parameter}`
    }
    if(Number.isNaN(num)){
        throw `Valid number required for ${parameter}`;
    }
}

const validWebsite = (website) => {
    const regex = new RegExp(/^http:\/\/www\.[\w\W]{5,}\.com$/i);
    if(!regex.test(website)){
        throw `Valid website URL needed`;
    }
}

const validObjectId = (id, param) => {
    validString(id, param);
    id = id.trim();
    if(!ObjectId.isValid(id)){
        throw `Valid ObjectId required for ${param}`;
    }
    return id;
}

const validEmail = (email) => {
    validString(email, "email");
    email = email.trim();
    const regex = new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
    if(!regex.test(email)){
        throw `Valid email id needed`;
    }
    return email;
}

const validation = {
    validString:validString,
    validArray:validArray,
    validWebsite: validWebsite,
    validNumber:validNumber,
    validObjectId: validObjectId,
    validEmail:validEmail
};

export default validation;