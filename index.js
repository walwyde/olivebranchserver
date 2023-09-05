const express = require("express");
const app = express();
const connectDB = require("./utils/db");
const dotenv = require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");
const path = require('path')

// const messageRoute = require("./routes/api/messages");
const authRoutes = require("./routes/api/auth");
const foodAuth = require("./routes/api/foodAuth");
// const appRoutes = require("./routes/api/appointment");
// const userRoutes = require("./routes/api/users");
// const profileRoutes = require("./routes/api/profile");

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "public")));


// app.use("/api/conversations", messageRoute);
// app.use("/api/appointment", appRoutes);
app.use("/api/food-auth", foodAuth);
// app.use("/api/users", userRoutes);
// app.use("/api/profile", profileRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  await connectDB.default();
  console.log(`Olive Branch app listening on port ${PORT}`);
});