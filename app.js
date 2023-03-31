import express from "express";
import "dotenv/config.js";
import {connectDB} from "./Data/connectDB.js"
import  landRoutes from "./Routes/land.js"

const app = express();
const port = 3000;


//middleware
app.use(express.json());

app.use('/land',landRoutes)


const start = async(req,res) =>{
    try {
        // await connectDB(process.env.MONGO_URL);
        // console.log("Database is connected");
        app.listen(port, ()=>{console.log("Server is listening on port 3000..")})
    } catch (error) {
       res.status(500).json(error);
    }
}
start()