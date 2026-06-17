const Joi = require("joi");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.object({
            url: Joi.string().allow("", null),
        }).unknown(true),
        category: Joi.string().valid("trending", "rooms", "iconic-cities", "mountains", "castles", "amazing-pools", "camping", "farms", "arctic", "domes", "boats", "beachfront", "treehouses", "mansions").allow(""),
    }).required(),
});


module.exports.reviewSchema = Joi.object({
    review:Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
});

module.exports.bookingSchema = Joi.object({
    booking: Joi.object({
        checkIn: Joi.date().iso().required(),
        checkOut: Joi.date().iso().greater(Joi.ref('checkIn')).required(),
        guests: Joi.number().required().min(1),
        listingId: Joi.string().required()
    }).required(),
});