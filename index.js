const express = require("express");
const app = express();

const userRoutes = require("./routes/user");
const courseRoutes = require("./routes/course");
const profileRoutes = require("./routes/Profile");
const paymentsRoutes = require("./routes/payment");

const database = require("./config/database");
const cookieParser = require("cookie-parser");

const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

const PORT = process.env.PORT || 4000;

// connect with db
database.connect();

// App middleware
app.use(express.json());
app.use(cookieParser());

// request comes from frontend localhost 3000 emtertain them [explore more later]
app.use(
  cors({
    origin: "http://localhost:30000",
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/temp",
  })
);

// cloudinary connection
cloudinaryConnect();

// routes mount
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentsRoutes);

// default route
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is running",
  });
});

app.listen(PORT, () => {
  console.log("Server is running on port ", PORT);
});
