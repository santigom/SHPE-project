require('dotenv').config();
const connectDB = require('./db');
const User = require("./models/User");

async function run(){
    await connectDB();
    const b = new User({
        username: "test01",
        email: "test01@gmail.com",
        password: "Test01!"
    });

    try{
        await b.save();
        console.log('Saved:', b);
    }
    catch(err){
        console.log('Error:', err.message);
    }
    process.exit(0);
}

run();