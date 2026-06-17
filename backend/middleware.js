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

// Middleware to check if user is authenticated
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "You must be logged in to perform this action" });
    }
    next();
};