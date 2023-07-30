const User = require("../models/user");
const Profile = require("../models/profile");
const { imageUploadToCloudinary } = require("../utils/imageUploader");

module.exports.updateProfile = async (req, res) => {
  try {
    const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;
    const userId = req.user.id;

    if (!contactNumber || !gender) {
      return res.status(402).json({
        success: false,
        message: "All fields are require",
      });
    }

    const userDetail = await User.findById(userId);
    console.log("de ", userDetail);

    const userProfileId = userDetail.additionalDetails;

    const profile = await Profile.findByIdAndUpdate(
      userProfileId,
      {
        dateOfBirth: dateOfBirth,
        about: about,
        contactNumber: contactNumber,
        gender: gender,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "User ptofile updated successfully",
      profile: profile,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating profile",
    });
  }
};

// delete account
module.exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const userDetail = await User.findById(userId);
    if (!userDetail) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    await Profile.findByIdAndDelete(userDetail.additionalDetails);

    // HW : delete user from all the coursers in which user has enrolled
    // find crone jobs npm

    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "Account has been deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting user account",
    });
  }
};

module.exports.getUserDetails = async (req, res) => {
  try {
    const id = req.user.id;
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();
    return res.status(200).json({
      success: true,
      message: "You can see all user details on you dash board",
      userDetails,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong finding user user details" + err.message,
    });
  }
};

module.exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user._id;

    const userDetails = await User.findById(userId).populate("course").exec();

    if (!userDetails) {
      return res.status(401).json({
        success: false,
        message: `No user found by this ${userId}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while getting enrolled courses" + err.message,
    });
  }
};

module.exports.updateDisplayPictures = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture;
    const userId = req.user.id;

    const image = await imageUploadToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    );

    const updatedProfile = await User.findByIdAndUpdate(
      userId,
      { image: image.secure_url },
      { new: true }
    );

    res.send({
      success: true,
      message: `Image Updated successfully`,
      updatedProfile,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message:
        "Somthingg went wrong while updating display picture " + err.message,
    });
  }
};
