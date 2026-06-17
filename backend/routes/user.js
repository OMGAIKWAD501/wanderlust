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
            user: { _id: registeredUser._id, username: registeredUser.username, email: registeredUser.email },
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
            user: { _id: user._id, username: user.username, email: user.email },
        });
    })(req, res, next);
}

// Login route
router.post("/login", authenticateLocal);

// Logout route (client-side deletes token)
router.post("/logout", (req, res) => {
    res.json({ message: "Logged out successfully" });
});

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

module.exports = router;