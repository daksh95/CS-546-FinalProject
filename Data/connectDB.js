import mongoose from 'mongoose';

export const connectDB = (URL)=>{
    return mongoose.connect(URL); 
}