import mongoose from "mongoose";
import dotenv from "dotenv";

export const connectDB = async() => {
    await mongoose.connect(process.env.CONNECTION_STRING)
    .then(() => console.log("DB Connected"))
}