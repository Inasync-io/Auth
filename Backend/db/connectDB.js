import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        // console.log('MONGO_URL:', process.env.MONGO_URL);  

        const conn = await mongoose.connect(process.env.MONGO_URL)
        console.log(`MongoDB Connected: ${conn.connection.host}`);       
    } catch (e) {
        console.log('Error connection to MongoDB: ',e.message);
        process.exit(1)
        
    }
}