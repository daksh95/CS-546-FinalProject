import validation from "../Utils/validation.js";
import hash from "../Utils/encryption.js";
import { getClient } from "../config/connection.js";   

//requies: typeOfUser, emailId, password
const addCredential = async(object) =>{
    //initalizing variables
    let {typeOfUser, emailId,password} = object; 
    let queryData ={};
    const client = getClient();

    //valid email
    emailId = validation.validEmail(emailId); 
    
    //Checking if emailId already exists
    try {
       let ans = await getCredentialByEmailId(emailId);
       if(ans){
            throw  `EmailId is already registered. Please login`;
       }
    }catch(e){
        queryData.emailId = emailId;    
    }

    // Validating string
    queryData.typeOfUser = validation.validString(typeOfUser, "typeOfUser");
    queryData.password = validation.validString(password, "password");
    
    //hashing the password
    queryData.password = await hash.generateHash(queryData.password);
    queryData.previousPassword =[];

    //inserting credential
    const result = await client.collection("credential").insertOne(queryData);
    
    //error handling, incase credential is not inserted
    if (!result.acknowledged || !result.insertedId) throw 'Could not create account';
    return "Created";
}
const getCredentialByEmailId = async(emailId) =>{
    
    //validating emailId
    emailId = validation.validEmail(emailId);
    
    //initializing db reference
    const client = getClient();

    //fetching credentials
    let result = await client.collection("credential").findOne({"emailId": emailId}).Project({_id:1, password:1, typeof:1});
    
    //Error handling
    if (result === null) throw "user not found";
   
    return result;
}

const updateEmailId = async(emailId, newEmailId) =>{
    //validating emailId
    emailId = validation.validEmail(emailId);
    newEmailId = validation.validEmail(newEmailId);

    if(emailId === newEmailId) throw `Current Email Id and new Email Id are same`;

    //Check if new Email Id already exist in database
    try {
        let ans = await getCredentialByEmailId(newEmailId);
        if(ans){
            throw `${newEmailId} is already being used. Please use a different Email Id`;
        }
    } catch (error) {}

    //initializing db reference
    const client = getClient();
    
    //fetching _id
    const userinfo = await getCredentialByEmailId(emailId);

    //Updating
    const result = await client.collection("credential").findOneAndUpdate({_id: userinfo._id},  {$set: {"emailId": newEmailId}}, {returnDocument: 'after'} );
    
    //Error handling
    if (result.lastErrorObject.n === 0) throw 'Could not update';
    
    return "updated";
}

const updatePassword = async(password, emailId)=>{ 
    //validating password
    password = validation.validString(password);
    password = hash.generateHash(password);
    
    //checking if new password is previously used
    let userInfo =  await getCredentialByEmailId(emailId);
    if(password == userInfo.password){
        throw `new password shouldn't be same as old password`;
    }

    for(let pass of userInfo.previousPassword){
        if(pass == password){
            throw `This password is previously used. Please another one`;
        }
    }

    
    //TODO combine this two update calls into one;
    let result = await client.collection("credential").findOneAndUpdate({_id: userInfo._id},  {$set: {"password": password}, }, {returnDocument: 'after'} );
    if (result.lastErrorObject.n === 0) throw 'Could not update'
    
    result = await client.collection("credential").findOneAndUpdate({_id: userInfo._id},{$push: {previousPassword: userInfo.password} }, {returnDocument: 'after'} ); 
    if (result.lastErrorObject.n === 0) throw 'Could not update';
    return "updated";

}

const credentialData = {
    addCredential:addCredential,
    getCredentialByEmailId:getCredentialByEmailId,
    updateEmailId:updateEmailId,
    updatePassword:updatePassword
}

export default credentialData;