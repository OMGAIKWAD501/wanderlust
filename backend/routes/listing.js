const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const { validateListing, isLoggedIn } = require("../middleware.js");

const multer = require('multer');
const { storage } = require('../cloudConfig.js');
const upload = multer({ storage });


// INDEX ROUTE
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const { search, minPrice, maxPrice } = req.query;
    
    let query = {};
    
    // Search by title, location, or country
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { title: searchRegex },
        { location: searchRegex },
        { country: searchRegex }
      ];
    }
    
    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Category
    const category = req.query.category;
    if (category) {
      query.category = category;
    }

    const alllistings = await Listing.find(query).populate("reviews");
    res.status(200).json(alllistings);
  })
);


// SHOW ROUTE
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    const foundlisting = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: { path: "author", select: "username email" },
      })
      .populate("owner", "username email");

    if (!foundlisting) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    res.status(200).json(foundlisting);
  })
);


// CREATE ROUTE — must be logged in
router.post(
  "/",
  isLoggedIn,
  upload.single("image"),
  wrapAsync(async (req, res) => {
    // If sent via FormData as flat fields, reconstruct req.body.listing
    if (!req.body.listing) {
      req.body.listing = {
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        country: req.body.country,
        price: req.body.price,
        category: req.body.category
      };
    }

    if (req.file) {
      req.body.listing.image = { url: req.file.path, filename: req.file.filename };
    } else if (req.body.imageUrl) {
      req.body.listing.image = { url: req.body.imageUrl, filename: "default" };
    }

    let result = listingSchema.validate(req.body);

    if (result.error) {
      throw new ExpressError(400, result.error);
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    await newListing.save();

    res.status(201).json({
      message: "Listing created successfully",
      listing: newListing,
    });
  })
);


// UPDATE ROUTE — must be logged in + must be owner
router.put(
  "/:id",
  isLoggedIn,
  upload.single("image"),
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }

    // Owner check
    if (listing.owner && !listing.owner.equals(req.user._id)) {
      return res.status(403).json({ error: "You don't have permission to edit this listing" });
    }

    if (!req.body.listing) {
      req.body.listing = {
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        country: req.body.country,
        price: req.body.price,
        category: req.body.category
      };
    }

    if (req.file) {
      req.body.listing.image = { url: req.file.path, filename: req.file.filename };
    } else if (req.body.imageUrl) {
      req.body.listing.image = { url: req.body.imageUrl, filename: "default" };
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      req.body.listing,
      { new: true }
    );

    res.status(200).json({
      message: "Listing Updated",
      listing: updatedListing,
    });
  })
);

// DELETE ROUTE — must be logged in + must be owner
router.delete(
  "/:id",
  isLoggedIn,
  wrapAsync(async (req, res) => {

    let { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }

    // Owner check
    if (listing.owner && !listing.owner.equals(req.user._id)) {
      return res.status(403).json({ error: "You don't have permission to delete this listing" });
    }

    await Listing.findByIdAndDelete(id);

    res.status(200).json({
      message: "Listing deleted successfully",
    });
  })
);

module.exports = router;