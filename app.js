import express from "express";
import "dotenv/config.js";
import {connectDB, getClient} from "./config/connection.js"
import  landRoutes from "./Routes/land.js"

const app = express();
const port = 3000;


//middleware
app.use(express.json());

app.use('/land',landRoutes)


const start = async() =>{
    try {
        await connectDB(process.env.MONGO_URI);
        console.log("Database is connected");
        app.listen(port, ()=>{console.log("Server is listening on port 3000..")})
        
    } catch (error) {
        console.log(error);
    }
}
start()