const express = require("express");
const route = express.Router();
const AuthMiddleware = require("../middlewares/auth");
const ProfileController = require("../controllers/profile");

// *********************************************************************************************
//                              Profile routes
// *********************************************************************************************

route.delete("/deleteProfile", AuthMiddleware.authenticate, ProfileController.deleteAccount);

route.put(
  "/updateProfile",
  AuthMiddleware.authenticate,
  ProfileController.updateProfile
);

route.get(
  "/getUserDetails",
  AuthMiddleware.authenticate,
  ProfileController.getUserDetails
);

// Get enrolled courses
route.get(
  "/getEnrolledCourses",
  AuthMiddleware.authenticate,
  ProfileController.getEnrolledCourses
);

// update display profile picture
route.put(
  "/updateDisplayPicture",
  AuthMiddleware.authenticate,
  ProfileController.updateDisplayPictures
);

module.exports = route;
