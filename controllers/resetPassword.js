const User = require("../models/user");
const crypto = require("crypto");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

// ResetPasswordToken
module.exports.resetPasswordToken = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "This email is not registered",
      }); 
    }

    const token = crypto.randomUUID();

    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      { token: token, resetPasswordExpires: Date.now() + 5 * 60 * 1000 },
      { new: true }
    );

    console.log("------", updatedUser);

    const url = `http://localhost:3000/update-password/${token}`;

    await mailSender(
      email,
      "Password Reset Link",
      `Your Link for email verification is ${url}. Please click this url to reset your password.`
    );

    return res.status(200).json({
      success: true,
      message: "Email sent successfully, Go and reset the password",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while reseting the password",
    });
  }
};

//ResetPassword
module.exports.resetPassword = async (req, res) => {
  try {
    // data fetch
    const { password, confirmPassword, token } = req.body;
    // validate
    if (password !== confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "You password did not matched",
      });
    }

    // get user details from DB using token
    const userDetails = await User.findOne({ token: token });
    console.log("userDe = ", userDetails);
    if (!userDetails) {
      return res.status(402).json({
        success: false,
        message: "User not present with this token",
      });
    }

    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.status(401).json({
        success: false,
        message:
          "Your link has expire please create new token to create new link",
      });
    }
    // if no entry in DB or password expires - invalid token
    const hashedPassword = await bcrypt.hash(password, 10);

    // hashed password and save
    const updateUserPass = await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true }
    );
    // return response
    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something wemt wrong while reset forgot password",
    });
  }
};
