import express from 'express';
import { redis } from '../lib/redis.js';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// take user id created at login and generate tokens
const generateTokens = (userId) => {
   const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET,{
      expiresIn: '15m',
   });

   const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET,{
      expiresIn: '7d',
   });

   return { accessToken, refreshToken };
};

// Store the refresh token in Redis cache
const storeRefreshToken = async (userId, refreshToken) => {
   await redis.set(`refresh_token: ${userId}`, refreshToken, 'EX', 7 * 24 * 60 * 60);
};

const setCookies = (res, accessToken, refreshToken) => {

   // Set the access token and refresh token as cookies client side
   res.cookie('acessToken', accessToken, {
      httpOnly: true, // Prevent XSS attacks
      secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS
      sameSite: 'strict', // Prevent CSRF attacks
      maxAge: 15 * 60 * 1000, // 15 minutes
   });

   res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Prevent XSS attacks
      secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS
      sameSite: 'strict', // Prevent CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
   });
};


export const signup = async (req, res) => {
   const { name, email, password } = req.body;
  
   try {
      const userExists = await User.findOne({ email });

      if (userExists) {
         return res.status(400).json({
            message: "User already exists"
         });
      }
      const user = await User.create({
         name,
         email,
         password
      });

      // authentication
     // token function calls from above
     const { accessToken, refreshToken } = generateTokens(user._id);
     await storeRefreshToken(user._id, refreshToken);

     setCookies(res, accessToken, refreshToken);
   
      res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
      });

   } catch (error) {
      console.log("Error in signup controller: ", error.message);
      res.status(500).json({message: "Server error", error: error.message});
   }
};

export const login = async (req, res) => {
   try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (user && (await user.comparePassword(password))) {
         const { accessToken, refreshToken } = generateTokens(user._id);

         await storeRefreshToken(user._id, refreshToken);
         setCookies(res, accessToken, refreshToken);

         res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
         });
      } else {
         res.status(401).json({ message: "Invalid email or password" });
      }
   } catch (error) {
      console.log("Error in login controller: ", error.message);
      res.status(500).json({ message: "Server error", error: error.message});
   }
};

export const logout = async (req, res) => {
   try {
      // jwt cookie parser middleware is used to parse the jwt token from the cookie
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) {
         const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
         await redis.del(`refresh_token: ${decoded.userId}`);
      }

      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.json({ message: 'Logged out successfully' });
   } catch (error) {
      console.log("Error in logout controller: ", error.message);
      res.status(500).json({ message: "Server error", error: error.message});
   }
};
