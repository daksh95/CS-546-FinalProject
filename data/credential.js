import validation from "../utils/validation.js";
import hash from "../utils/encryption.js";
import { getClient } from "../config/connection.js";   
import { credentialCollection } from "./collectionNames.js";
import { ObjectId } from "mongodb";

//requies: typeOfUser, emailId, password
const addCredential = async(object) =>{
    //initalizing variables
    let {typeOfUser, emailId, password} = object; 
    let queryData ={};
    const client = getClient();

    //valid email
    queryData.emailId  = validation.validEmail(emailId); 
    
    //Checking if emailId already exists
    let ans;
    try {
       ans = await getCredentialByEmailId(queryData.emailId);
    }catch(e){
       
    }
    if(ans){
        throw `EmailId is already registered. Please login`;
   }
    
    // Validating string
    queryData.typeOfUser = validation.validTypeOfUser(typeOfUser);
    queryData.password = validation.validPassword(password);
    
    //hashing the password
    queryData.password = await hash.generateHash(queryData.password);
    
    //default values
    queryData.isApproved = false;
    queryData.profileSetUpDone = false;
    queryData.previousPassword =[];

    //inserting credential
    const result = await client.collection(credentialCollection).insertOne(queryData);
    console.log("inside auth add",result);
    //error handling, incase credential is not inserted
    if (!result.acknowledged || !result.insertedId) throw 'Could not create account';
    return true;
}
const getCredentialByEmailId = async(emailId) =>{
    
    //validating emailId
    emailId = validation.validEmail(emailId);

    //initializing db reference
    const client = getClient();

    //fetching credentials
    let result = await client.collection(credentialCollection).findOne({"emailId": emailId});

    //Error handling
    if (result === null) throw "user not found";
    result._id = result._id.toString();
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
    const result = await client.collection(credentialCollection).findOneAndUpdate({_id: userinfo._id},  {$set: {"emailId": newEmailId}}, {returnDocument: 'after'} );
    
    //Error handling
    if (result.lastErrorObject.n === 0) throw 'Could not update';
    
    return true;
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
    let result = await client.collection(credentialCollection).findOneAndUpdate({_id: userInfo._id},  {$set: {"password": password}, }, {returnDocument: 'after'} );
    if (result.lastErrorObject.n === 0) throw 'Could not update'
    
    result = await client.collection(credentialCollection).findOneAndUpdate({_id: userInfo._id},{$push: {previousPassword: userInfo.password} }, {returnDocument: 'after'} ); 
    if (result.lastErrorObject.n === 0) throw 'Could not update';
    return true;

}

const updateProfileStatus = async(id,profileSetUpDone)=>{
    id = validation.validObjectId(id, "credentialId");
    validation.validBool(profileSetUpDone, "Profile set up status");
    const client = getClient();
    let result = await client.collection(credentialCollection).findOneAndUpdate({_id: new ObjectId(id)}, {$set: {"profileSetUpDone": profileSetUpDone}}, { returnDocument: "after" });
    if (result.lastErrorObject.n < 1) {
        throw `Could not update profile set up status`;
    }
    console.log(result);
    return;
}

const deleteCredentialByEmailId = async(emailId)=>{
    emailId = validation.validEmail(emailId);
    const client = getClient();
    let result = await client.collection(credentialCollection).findOneAndDelete({"emailId": emailId});//todo error handling if its not deleted;
    return;
}

const credentialData = {
    addCredential:addCredential,
    getCredentialByEmailId:getCredentialByEmailId,
    updateEmailId:updateEmailId,
    updatePassword:updatePassword,
    updateProfileStatus:updateProfileStatus,
    deleteCredentialByEmailId: deleteCredentialByEmailId
}

export default credentialData;