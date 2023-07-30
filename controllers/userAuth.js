
const User = require("../models/user");
const OTP = require("../models/otp");
const Profile = require("../models/profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const EmailVerificationTemplate = require("../mail/template/emailVarification");
require("dotenv").config();

// sent OTP
exports.sendOTP = async (req, res) => {

    try {
        // fetch email from req.body
        const {email} = req.body;

        // check if user is already exist
        const checkUserPresent = await User.findOne({email: email});

        // if already exist return res
        if(checkUserPresent) {
            return res.status(401).json({
                sucesss: false,
                message: "User already exist"
            });
        }

        // generate otp
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });

        // verify otp is unique
        const isOtpPresent = await OTP.findOne({otp: otp});

        while(isOtpPresent) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });
            isOtpPresent = await OTP.findOne({otp: otp});
        }

        const otpPayload = {email, otp};
        
        // create entry in db
        const otpBody = await OTP.create(otpPayload);

        return res.status(200).json({
            success: true,
            otpBody,
            message: "OTP sent successfully"
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}



// sign Up
module.exports.signUp = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            otp,
        } = req.body;

        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "All fields are required"
            });
        }

        if(password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and confPass did not matched"
            });
        }

        const existUser = await User.findOne({email});
        if(existUser) {
            return res.status(400).json({
                success: false,
                existUser,
                message: "User is already registered"
            });
        }

        const recentOtp = await OTP.find({email}).sort({createdAt: -1}).limit(1);
        console.log("------------", recentOtp);
        if(recentOtp.length == 0 || otp !== recentOtp[0].otp) {
            return res.status(400).json({
                success: false,
                message:  "OTP not valid or found"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        return res.status(201).json({
            success: true,
            user,
            message: "User created !"
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "User can not be registred please try again"
        });
    }
}

// logIn
module.exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;
        
        if(!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All fields are required"
            });
        }

        let user = await User.findOne({email}).populate("additionalDetails");

        if(!user) {
            return res.status(400).json({
                success: false,
                message: "User is not registered, please signUp first"
            });
        }

        if(await bcrypt.compare(password, user.password)) {
            let payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h"
            });
            
            user = user.toJSON();
            user.token = token;
            user.password = undefined;

            // create cookie

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }
            
            res.cookie("token", token, options).status(200).json({
                sucesss: true,
                user,
                token: token,
                message: "User logged in successfully"
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid username or password"
            });
        }

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Login failure, please try again"
        });
    }
}


// chnage password
module.exports.chnagePassword = async (req, res) => {
    try {
        const {oldPassword, newPassword, confirmPassword} = req.body;

        if(!oldPassword || !newPassword || !confirmPassword) {
            return res.status(403).json({
                success: false,
                message: "All fields are required"
            });
        }

        // check old password is matching or not
        let user = User.findById(req.user._id);

        if(!await bcrypt.compare(oldPassword, user.password)) {
            return res.status(401).json({
                success: false,
                message: "old password did not matched"
            });
        }

        // check if newPassword and confirmPassword are matching or not
        if(newPassword !== confirmPassword) {
            return res.status(401).json({
                success: false,
                message: "newPassword and confirmPassword did not matched"
            });
        }

        // save password to DB
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          {
            password: hashedPassword,
          },
          { new: true }
        );

        console.log("Updated user = ", updatedUser);

        // send the mail to the user
        await mailSender(
          updatedUser.email,
          "Password changed Verification",
          "Yor password has been updates successfully"
        );

        // return response
        return res.status().json({
            success: true,
            message: "password has been chnaged"
        });
    } catch (err) {
        return res.status().json({
            success: true,
            message: "password has been chnaged"
        });
    }
}
