
const mongoose = require("mongoose");
require("dotenv").config();


module.exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("DB connect successfully");
    })
    .catch((err) => {
        console.log("DB connection failed");
        console.error(err);
        process.exit(1);
    });
}