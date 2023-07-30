const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const EmailVerificationTemplate = require("../mail/template/emailVarification");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5 * 60,
  },
});

// function to send mail
async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email",
      EmailVerificationTemplate.otpTemplate(otp),
    );
    console.log("Email send successfully ", mailResponse);
  } catch (err) {
    console.log("Error while send otp verification email ", err);
    throw err;
  }
}

otpSchema.pre("save", async function (next) {
  console.log("OTP get saved and mail sended too");
  sendVerificationEmail(this.email, this.otp);
  next();
});

module.exports = mongoose.model("OTP", otpSchema);
