import { ObjectId } from "mongodb";
import validation from "../Utils/validation.js";
import { getClient } from "../config/connection.js";
//fetch all the information about the a single land from transaction collection
const getTransactionsByLandId = async(id) => {
    validation.validString(id, "id");
    id = id.trim();
    if(!ObjectId.isValid(id)){
        throw "Valid id is needed";
    }
    const client = getClient();
    const result = client.collection("transaction").find({landId: new ObjectId (id)},{_id:0,buyer:1, status:1}).toArray();
    if(result.lenght<1){
        throw "No transaction from that ID";
    }
    // Get users by ID.
    const {name: buyerName} = await getUserById(result.buyer.id);
    // 
    const data={
        buyer: buyerName,
        bid: result.buyer.bid,
        status: result.status,
    };
    return data;
};