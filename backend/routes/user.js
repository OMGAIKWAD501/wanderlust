const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

// Register route
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Username, email, and password are required" });
        }

        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        
        req.logIn(registeredUser, (err) => {
            if (err) {
                console.error("Login error after registration:", err);
                return res.status(500).json({ error: "Registration successful but login failed" });
            }
            res.status(201).json({
                message: "User registered successfully",
                user: registeredUser,
            });
        });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(400).json({ error: err.message });
    }
});

// Custom passport authentication middleware for JSON responses
function authenticateLocal(req, res, next) {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(401).json({ error: info.message || "Authentication failed" });
        }
        req.logIn(user, (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            return res.json({
                message: "Logged in successfully",
                user: user,
            });
        });
    })(req, res, next);
}

// Login route
router.post("/login", authenticateLocal);

// Logout route
router.post("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.json({ message: "Logged out successfully" });
    });
});

// Get current user
router.get("/current-user", (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.json(null);
    }
});

module.exports = router;