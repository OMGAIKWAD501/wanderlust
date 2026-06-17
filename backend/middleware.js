const { listingSchema, reviewSchema, bookingSchema } = require("./schema");
const ExpressError = require("./utils/ExpressError");

module.exports.validateBooking = (req, res, next) => {
    const { error } = bookingSchema.validate(req.body);

    if (error) {
        throw new ExpressError(
            400,
            error.details.map(el => el.message).join(", ")
        );
    }

    next();
};


module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);

    if (error) {
        throw new ExpressError(
            400,
            error.details.map(el => el.message).join(", ")
        );
    }

    next();
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        throw new ExpressError(
            400,
            error.details.map(el => el.message).join(", ")
        );
    }

    next();
};

const jwt = require("jsonwebtoken");

// Middleware to check if user is authenticated via JWT
module.exports.isLoggedIn = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "No token provided, you must be logged in" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
        
        // We can fetch the user from DB if we want, or just attach decoded payload
        // Assuming payload has _id and username
        req.user = decoded; 
        
        next();
    } catch (err) {
        console.error("JWT Verification Error:", err);
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};