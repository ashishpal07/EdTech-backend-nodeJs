const express = require("express");
const route = express.Router();

const PaymentController = require("../controllers/payment");
const AuthMiddleware = require("../middlewares/auth");

route.post(
  "/capturePayment",
  AuthMiddleware.authenticate,
  AuthMiddleware.isStudent,
  PaymentController.capturePayment
);

route.post("/verifySignature", PaymentController.varifySignature);

module.exports = route;
