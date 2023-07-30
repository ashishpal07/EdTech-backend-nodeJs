const express = require("express");
const route = express.Router();

const UserAuthController = require("../controllers/userAuth");
const ResetPasswordController = require("../controllers/resetPassword");
const AuthMiddleware = require("../middlewares/auth");

// Routes for login, signUp and authenticaton

// *********************************************************************************************
//                              Authentication routes
// *********************************************************************************************

route.post("/login", UserAuthController.login);

route.post("/signup", UserAuthController.signUp);

route.post("/sendotp", UserAuthController.sendOTP);

route.post(
  "/changepassword",
  AuthMiddleware.authenticate,
  UserAuthController.chnagePassword
);

// *********************************************************************************************
//                              Reset password routes
// *********************************************************************************************

// Route for generating a reset password token
route.post("/reset-password-token", ResetPasswordController.resetPasswordToken);

// Route for resetting user's password after verification
route.post("/reset-password", ResetPasswordController.resetPassword);

module.exports = route;
