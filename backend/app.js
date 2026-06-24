require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js"); 
const path = require("path");
const review = require("./models/review.js"); 
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const cors = require("cors");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listings = require("./routes/listing.js");
const users = require("./routes/user.js");
const aiRoutes = require("./routes/ai.js");
const bookingRoutes = require("./routes/booking.js");
const { validateReview, isLoggedIn } = require("./middleware.js");

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";

// Connect DB
async function main() {
    await mongoose.connect(MONGO_URL);
}

main()
    .then(() => console.log("connected to DB"))
    .catch((err) => console.log(err));


// Middleware
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ================= CORS CONFIGURATION ================= //
let frontendOrigins = ["http://localhost:5173"];
if (process.env.FRONTEND_URL) {
  // Handle multiple URLs separated by commas, spaces, or ||
  frontendOrigins = process.env.FRONTEND_URL
    .split(/\|\||,/)
    .map(url => url.trim().replace(/\/$/, ''))
    .filter(url => url.length > 0);
}

app.use(cors({
    origin: frontendOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
}));

app.use(express.json({ limit: "10mb" }));

// ================= PASSPORT CONFIGURATION ================= //
app.use(passport.initialize());

passport.use(new LocalStrategy(User.authenticate()));

// Root
app.get("/", (req, res) => {
    res.send("WanderLust API is running");
});

// ================= ROUTES ================= //

app.use("/listings", listings);
app.use("/users", users);
app.use("/api/ai", aiRoutes);
app.use("/bookings", bookingRoutes);

//Reviews
//Post route to create a new review for a listing — must be logged in
app.post("/listings/:id/reviews", isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    const newReview = new review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    // Populate author before sending back
    await newReview.populate("author", "username email");
    res.status(201).json({ message: "Review added", review: newReview });
}));

// Delete a review — must be logged in + must be author
app.delete("/listings/:id/reviews/:reviewId", isLoggedIn, wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    const foundReview = await review.findById(reviewId);
    if (!foundReview) {
        return res.status(404).json({ error: "Review not found" });
    }
    if (foundReview.author && !foundReview.author.equals(req.user._id)) {
        return res.status(403).json({ error: "You don't have permission to delete this review" });
    }
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await review.findByIdAndDelete(reviewId);
    res.status(200).json({ message: "Review deleted" });
}));

app.all("/{*splat}", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err,req, res, next) => {
    let {statusCode = 500, message ="something went wrong"} = err;
    res.status(statusCode).json({ error: message });
});


// SERVER
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`server is listening to port ${PORT}`);
});