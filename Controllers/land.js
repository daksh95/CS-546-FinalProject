import landData from "../Data/land.js";

const getLand = async (req, res)=>{
    const result = await landData.getLand(req.params.id);
    res.status(200).json({data: result});
};
const getAllLand = async (req, res)=>{
        res.status(200).json({msg: ` no lands here`});
};

const updateLand = async (req, res) =>{

};

const postLand = async (req, res) =>{

};

const removeLand = async(id)=> {

};

// const landRestMethods = {
//     getAllLand: getAllLand,
//     getLand:getLand,
//     updateLand: updateLand,
//     postLand: postLand,
//     removeLand:removeLand
// }

export {getAllLand, getLand, updateLand, postLand, removeLand};

