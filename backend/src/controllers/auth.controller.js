import { generateToken } from '../lib/utils.js';
import {User} from '../models/user.model.js'
import bcrypt from 'bcryptjs'

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
    
}
export const logout = async (req, res) => {
    
}