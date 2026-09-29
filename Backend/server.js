require('dotenv').config();
require("./src/config/env");

const app = require('./src/app');
const connectDB = require('./src/db/db')

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

connectDB();