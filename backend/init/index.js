const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(MONGO_URL);
}

// ✅ FIX: call initDB AFTER connection
main()
    .then(async () => {
        console.log("connected to DB");

        await initDB();
    })
    .catch((err) => {
        console.log(err);
    });

const initDB = async () => {
    await Listing.deleteMany({});
    
    const categories = ["trending", "rooms", "iconic-cities", "mountains", "castles", "amazing-pools", "camping", "farms", "arctic", "domes", "boats", "beachfront", "treehouses", "mansions"];
    
    const newData = initData.data.map(obj => ({
        ...obj,
        category: categories[Math.floor(Math.random() * categories.length)]
    }));

    await Listing.insertMany(newData);
    console.log("data was initialized");
};