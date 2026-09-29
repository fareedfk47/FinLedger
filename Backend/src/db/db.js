const mongoose = require("mongoose");

function connectDB() {
  mongoose.connect(process.env.MONGOOSE_URI).then(() => {
    console.log("Database connected successfully");
  }).catch((error) =>{
    console.error("Database connection error", error);
    process.exit(1); 
  })
}

module.exports = connectDB;