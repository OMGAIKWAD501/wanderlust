const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    return jwt.sign(
        { _id: user._id, username: user.username, email: user.email },
        process.env.JWT_SECRET || "fallback_secret",
        { expiresIn: "7d" }
    );
};

// Register route
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Username, email, and password are required" });
        }

        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        
        const token = generateToken(registeredUser);
        
        res.status(201).json({
            message: "User registered successfully",
            token,
            user: { _id: registeredUser._id, username: registeredUser.username, email: registeredUser.email, avatar: registeredUser.avatar },
        });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(400).json({ error: err.message });
    }
});

// Custom passport authentication middleware for JSON responses
function authenticateLocal(req, res, next) {
    passport.authenticate("local", { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(401).json({ error: info.message || "Authentication failed" });
        }
        
        const token = generateToken(user);
        
        return res.json({
            message: "Logged in successfully",
            token,
            user: { _id: user._id, username: user.username, email: user.email, avatar: user.avatar },
        });
    })(req, res, next);
}

// Login route
router.post("/login", authenticateLocal);

// Logout route (client-side deletes token)
router.post("/logout", (req, res) => {
    res.json({ message: "Logged out successfully" });
});

const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

const multer = require('multer');
const { storage } = require('../cloudConfig.js');
const upload = multer({ storage });

// Get current user (expects Bearer token in header, checked via isLoggedIn middleware if we wanted, but let's just decode it)
router.get("/current-user", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.json(null);
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
        res.json(decoded);
    } catch (err) {
        res.json(null);
    }
});

// GET user profile
router.get("/:id", wrapAsync(async (req, res) => {
    const user = await User.findById(req.params.id).select("-salt -hash");
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const listings = await Listing.find({ owner: user._id }).lean();
    const reviews = await Review.find({ author: user._id }).populate("listing", "title _id image").lean();

    res.json({
        user,
        listings,
        reviews
    });
}));

// PATCH update user profile
router.patch("/:id", isLoggedIn, upload.single("avatar"), wrapAsync(async (req, res) => {
    if (req.user._id !== req.params.id) {
        return res.status(403).json({ error: "You can only edit your own profile" });
    }

    const { username, email, bio } = req.body;
    const updateData = {};

    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (bio !== undefined) updateData.bio = bio;

    if (req.file) {
        updateData.avatar = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    // Check if new email/username already exists
    if (username || email) {
        const existingUser = await User.findOne({
            $or: [{ username }, { email }],
            _id: { $ne: req.user._id }
        });
        if (existingUser) {
            return res.status(400).json({ error: "Username or email is already taken." });
        }
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select("-salt -hash");
    
    // We should also return a new token so the frontend can update its localStorage state
    const token = generateToken(updatedUser);

    res.json({ message: "Profile updated successfully", user: updatedUser, token });
}));

module.exports = router;