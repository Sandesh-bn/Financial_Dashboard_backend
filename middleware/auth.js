import User from '../models/userModel.js';
import dotenv from "dotenv";
import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET;

export default async function authMiddleware(request, response, next){

    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")){
        return response.status(401).json({
            success: false,
            message: "Not authorized or token missing"
        })
    }


    const token = authHeader.split(" ")[1];

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(payload.id).select("-password");

        if (!user){
            return response.status(401).json({
                success: false,
                message: "User not found"
            })
        }

        request.user = user;
        next();

    } catch (error) {
        console.log("Error with jwt verification ", error);
        return response.status({
            success: false,
            message: "Token invalid or expired."
        })
    }
}