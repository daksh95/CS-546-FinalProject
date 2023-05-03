import hash from "./utils/encryption.js";
import { connectDB, getClient, connectionClose } from "./config/connection.js";
import "dotenv/config.js"

const password = "Admin@1234$";
const prevPassword = "ABCDefgh@12345";

let passwordHash;
let prevPasswordHash;

try {
  passwordHash = await hash.generateHash(password);
  prevPasswordHash = await hash.generateHash(prevPassword);
} catch (e) {
  console.log(e);
}

let adminUser = {
  emailId: "admin@stevens.edu",
  typeOfUser: "admin",
  password: passwordHash,
  previousPassword: [prevPasswordHash]
};

console.log(adminUser);

try {
  await connectDB(process.env.MONGO_URI);
  const client = getClient();
  const result = await client.collection('credential').insertOne(adminUser);
  
  if (!result.acknowledged || !result.insertedId) throw "Inserting admin failed";
  console.log(`Admin created with ID: ${result.insertedId.toString()}`);
} catch (error) {
  console.log(error);
}

await connectionClose();