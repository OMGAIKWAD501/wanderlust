const mongoose = require("mongoose");
const review = require("./review");
const Schema = mongoose.Schema;

const listeningschema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,

    // ✅ FIXED: proper object structure
    image: {
        url: {
            type: String,
            default: "https://images.unsplash.com/photo-1530789253388-582c481c54b0",
            set: (v) =>
                v === ""
                    ? "https://images.unsplash.com/photo-1530789253388-582c481c54b0"
                    : v,
        },
        filename: {
            type: String,
            default: "default",
        },
    },

    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,    
            ref: "Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    category: {
        type: String,
        enum: ["trending", "rooms", "iconic-cities", "mountains", "castles", "amazing-pools", "camping", "farms", "arctic", "domes", "boats", "beachfront", "treehouses", "mansions"],
        default: "trending",
    },
});

const Listing = mongoose.model("Listing", listeningschema);
module.exports = Listing;