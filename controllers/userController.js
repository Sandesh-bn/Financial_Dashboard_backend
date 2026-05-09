import User from '../models/userModel.js';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import dotenv from "dotenv";
import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRES = '24h';

function createToken(userId) {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES })
}


export async function registerUser(request, response) {
    const { name, email, password } = request.body;
    if (!name || !email || !password) {
        return response.status(400).json({
            success: false,
            message: 'All fields are required'
        })
    }

    if (!validator.isEmail(email)) {
        return response.status(400).json({
            success: false,
            message: 'Invalid email'
        })
    }
    if (password.length < 8) {
        return response.status(400).json({
            success: false,
            message: 'Password should be atleast 8 characters long'
        })
    }

    try {
        if (await User.findOne({ email })) {
            return response.status(400).json({
                success: false,
                message: "User already exists with that email"
            })
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashed });
        const token = createToken(user._id);


        response.status(200).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email }
        })
    }
    catch (error) {
        console.log("Error in registration ", error);
        response.status(500).json({
            success: false,
            message: "Registration failed"
        })
    }
}


export async function loginuser(request, response) {
    const { email, password } = request.body;

    if (!email || !password) {
        return response.status(400).json({
            success: false,
            message: "Both fields are required"
        })
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return response.status(401).json({
                success: false,
                message: "Invalid email or passowrd"
            })
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return response.status(401).json({
                success: false,
                message: "Invalid email or passowrd"
            })
        }

        const token = createToken(user._id);

        response.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    }
    catch (error) {
        console.log("Error in login ", error);
        response.status(500).json({
            success: false,
            message: "Login failed"
        })
    }
}


export async function getCurrentUser(request, response){
    try {
        const user = await User.findById(request.user.id).select("name email");

        if (!user){
            response.status(404).json({
                success: false,
                message: "User not found"
            })
        }


        response.json({ success: true, user })
    } catch (error) {
        
        console.log("Error in getting user ", error);
        response.status(500).json({
            success: false,
            message: "Getting user failed"
        })
    }
}


export async function updateProfile(request, response) {
  const { email, name, password } = request.body;

  if (!name || !email || !validator.isEmail(email)) {
    return response.status(400).json({
      success: false,
      message: "Valid email and name are required",
    });
  }

  try {
    // check if email already exists for another user
    const isExist = await User.findOne({
      email,
      _id: { $ne: request.user.id },
    });

    if (isExist) {
      return response.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // build update object dynamically
    const updateData = {
      name,
      email,
    };

    // 🔐 optional password update
    if (password && password.trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const user = await User.findByIdAndUpdate(
      request.user.id,
      updateData,
      {
        new: true,
        runValidators: true,
        select: "name email",
      }
    );

    return response.json({
      success: true,
      user,
    });
  } catch (error) {
    console.log("Error in update", error);
    return response.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
}

export async function updatePassword(request, response){
    const { currentPassword, newPassword } = request.body;

    if (!currentPassword || !newPassword || newPassword.length < 8){

        return response.status(400).json({
            success: false,
            message: "Password invalid or too short"
        })
    }

    try {
        const user = await User.findById(request.user.id).select("password");

        if (!user){
            return response.status(404).json({
                success: false,
                message: "User not found."
            })
        }


        const match = await bcrypt.compare(currentPassword, user.password);


        if (!match){
            return response.status(401).json({
                success: false,
                message: "Current Password is incorrect"
            })
        }

        user.password = await bcrypt.hash(newPassword, 10);

        await user.save();

        response.json({
            success: true,
            message: "Password changed successfully."
        })

    } catch (error) {
        console.log("Error in password change ", error);
        response.status(500).json({
            success: false,
            message: "Password change failed"
        })
    }
}



