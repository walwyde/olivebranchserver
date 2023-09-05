const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

const connectDB = async () => {
  try {
    console.log(process.env.MONGO_URI)
    const connetion = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
     
    });
    if (!connetion.connection) {
      process.abort();
    }
    console.log(`MongoDB connected: ${connetion.connection.host}`);
  } catch (err) {
    if (err) console.log(err);
  }
};
exports.default = connectDB;
