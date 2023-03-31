
const validString = (string, parameter) =>{
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
const validArray = (array, parameter) =>{

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

const validNumber =(num, parameter)=>{
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

const validWebsite = (website) =>{
    const regex = new RegExp(/^http:\/\/www\.[\w\W]{5,}\.com$/i);
    if(!regex.test(website)){
        throw `Valid website URL needed`;
    }
}


const validation ={
    validString:validString,
    validArray:validArray,
    validWebsite: validWebsite,
    validNumber:validNumber,
};
export default validation;