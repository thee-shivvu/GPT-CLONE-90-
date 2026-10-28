const mongoose = require("mongoose");

async function connectDb() {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("mongodb connected successfully");
  } catch (error) {
    console.log("Error connecting to DataBase", err);
  }
}
module.exports = connectDb;
