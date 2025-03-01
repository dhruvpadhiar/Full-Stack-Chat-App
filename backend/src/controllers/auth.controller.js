import { generateToken } from '../lib/utils.js';
import {User} from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import cloudinary from '../lib/cloudinary.js'

export const signup = async (req, res) => {
    const {fullName, email,  password} = req.body;
    try {
        
        if(password.length < 6){
            res.status(400).json({message: "Password should be longer than 6 charac"})  
        }

        const user = await User.findOne({email});
        if(user) res.status(400).json({message: "User with the email already exists"})
        
        //hash passwords
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        })
        
        if(newUser){
            generateToken(newUser._id,res)
            await newUser.save(); 
            res.status(201).json({id: newUser._id, fullName:newUser.fullName, message: "User Created Successfully"})
        }else{
            res.status(400).json({message: "Invalid User Data"})
        }

    } catch (error) {
        console.log(`Error while creating user (signup) ${error.message}`)
        res.status(500).json({message: "Something went wrong"})
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body;
    try {
        if(!email || !password){
            res.status(400).json({message: "Email and Password are required"})
        }
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message: "Invalid Credentials"})   
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid Credentials"})
        }

        generateToken(user._id,res)
        res.status(200).json({id: user._id, fullName: user.fullName, email: user.email, profilePic: user.profilePic, message: "Login Successful"})

    } catch (error) {
        console.log(`Error while logging in user (login) ${error.message}`)
        res.status(500).json({message: "Internal Server Error"})
    }
    
}
export const logout = async (req, res) => {
    try {
        res.cookie('jwt', '', {maxAge:0});
        res.status(200).json({message: "Logout Successful"})
    } catch (error) {
        console.log(`Error while logging out user (logout) ${error}`)
        res.status(500).json({message:"Internal Server Error"})
    }
}

export const updateProfile = async (req, res) => {
    try{
        const {profilePic}=req.body;
        const userId = req.user._id

        if(!profilePic){
            res.status(400).json({message: "Profile Picture is required"})
        }

        const uploadResponse =  await cloudinary.uploader.upload(profilePic)
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic: uploadResponse.secure_url}, {new: true})

        res.status(200).json({profilePic: updatedUser.profilePic, message: "Profile Picture Updated Successfully"})

    }catch(error){
        console.log(`Error while updating profile picture (updateProfile) ${error.message}`)
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const checkAuth = async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log(`Error in checkAuth Controller (checkAuth) ${error.message}`)
        res.status(500).json({message: "Internal Server Error"})
    }
}