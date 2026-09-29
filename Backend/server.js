require('dotenv').config();
require("./src/config/env");

const app = require('./src/app');
const connectDB = require('./src/db/db')

app.listen(3000, () =>{
    console.log('Server is running on port 3000');
})

connectDB();