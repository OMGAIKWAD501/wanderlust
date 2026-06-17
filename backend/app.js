require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js"); 
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const review = require("./models/review.js"); 
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("./schema.js");
const cors = require("cors");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");

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


// ✅ FIX: engine FIRST
app.engine("ejs", ejsMate);

// // ✅ THEN view engine
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ================= CORS CONFIGURATION ================= //
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
}));

app.use(express.json({ limit: "10mb" }));

// ================= SESSION CONFIGURATION ================= //

const store = MongoStore.create({
    mongoUrl: MONGO_URL,
    touchAfter: 24 * 3600, // lazy session update (in seconds)
    crypto: {
        secret: process.env.SESSION_SECRET || "thisshouldbeabettersecret",
    },
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
    store: store,
    secret: process.env.SESSION_SECRET || "thisshouldbeabettersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production", // Set to true in production with HTTPS
    },
};

app.use(session(sessionConfig));

// ================= PASSPORT CONFIGURATION ================= //
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Root
app.get("/", (req, res) => {
    res.send("hi, I am root");
});

app.get("/test", async (req, res) => {
    let fakeuser = new User({ username: "testuser", email: "testuser@example.com" });
    await fakeuser.save();
    res.send(fakeuser);

    let registeredUser = await User.register(new User({ username: "testuser2", email: "testuser2@example.com" }), "password123");
    res.send(registeredUser);
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
    if (foundReview && foundReview.author && !foundReview.author.equals(req.user._id)) {
        return res.status(403).json({ error: "You don't have permission to delete this review" });
    }
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await review.findByIdAndDelete(reviewId);
    res.status(200).json({ message: "Review deleted" });
}));

// app.all("*", (req, res, next) => {
//     next(new ExpressError(404, "Page Not Found!"));
// });

app.use((err,req, res, next) => {
    let {statusCode = 500, message ="something went wrong"} = err;
    res.status(statusCode).json({ error: message });
});


// SERVER
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`server is listening to port ${PORT}`);
});