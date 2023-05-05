// import mongoose from 'mongoose';
import { MongoClient } from "mongodb";

let client;
export const connectDB = async (URI)=>{
    // return mongoose.connect(URL); 
    client = new MongoClient(URI);
    await client.connect();
}
export const getClient =()=>{
    if(typeof client == "undefined"){
        throw "Error: Client is not connected to database. Please initialise connection by using connectDB()";
    }
    return client.db();
}

export const connectionClose = async ()=>{
    if(typeof client == "undefined"){
        throw "Error: No connection to close. Client is not connected to database.";
    }
    await client.close();
    client = undefined;
    return;
}