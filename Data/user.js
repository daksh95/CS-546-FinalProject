import validation from "../Utils/validation.js"
import { getClient } from "../config/connection.js";

const getOwnerByLandId = async (landID)=> {

}

const getUserByEmail = async (email)=> {
   email = validation.validEmail(email);
   const client = getClient();
   const result = await client.collection("users").findOne({emailId: email});
   return result;
}

const updateUserData = async (email)=> {
    
}

const getUserById = async(id)=>{
    
}