const mongoose = require('mongoose');
require('dotenv').config({path: ".env"});

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.DB_MONGO, {
        });

        console.log("DB Connected")
    } catch(e) {
        console.log('Occur an error');
        console.log(e);
        process.exit(1);
    }
}

module.exports = dbConnect;