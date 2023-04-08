import { getClient } from "../config/connection.js";
const getLand = async (id)=>{

};
const getAllLand = async ()=>{
    const client = getClient();
    const result = await client.collection("land").find().toArray();
    return result;
};

const updateLand = async (object) =>{

};

const postLand = async (object) =>{

};

const removeLand = async(id)=> {

};

const landData = {
    getAllLand: getAllLand,
    getLand:getLand,
    updateLand: updateLand,
    postLand: postLand,
    removeLand:removeLand
}

export default landData;