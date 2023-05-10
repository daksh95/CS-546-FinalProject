import bcrypt from "bcrypt";
const saltRounds= 12;

const getSaltRounds = ()=>{
    return saltRounds;
}

const generateHash = async (secret)=>{
    let hash;
    try {
        hash = await bcrypt.hash(secret, saltRounds);
    } catch (error) {
        throw `Problem in encrypting`;
    }
    return hash;
}

const compareHash = async (secret, hash)=>{
    let bool
    try {
        bool = await bcrypt.compare(secret, hash);

    } catch (error) {
        throw `Difficult in comparing encrypted data`;
    }   
    return bool;
}

const hash ={
    generateHash:generateHash,
    compareHash:compareHash
}
export default hash;