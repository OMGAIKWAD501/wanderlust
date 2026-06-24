const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const { isLoggedIn, validateBooking } = require("../middleware");

// Create a new booking
router.post("/", isLoggedIn, validateBooking, async (req, res) => {
    try {
        const { checkIn, checkOut, guests, listingId } = req.body.booking;
        
        const listing = await Listing.findById(listingId);
        if (!listing) return res.status(404).json({ error: "Listing not found" });

        // Ensure check-in is before check-out
        const ci = new Date(checkIn);
        const co = new Date(checkOut);
        if (ci >= co) {
            return res.status(400).json({ error: "Check-out must be after check-in." });
        }

        // Check for overlapping bookings
        const overlapping = await Booking.findOne({
            listing: listingId,
            status: "confirmed",
            $or: [
                { checkIn: { $lt: co }, checkOut: { $gt: ci } }
            ]
        });

        if (overlapping) {
            return res.status(400).json({ error: "These dates are already booked." });
        }

        const timeDiff = Math.abs(co.getTime() - ci.getTime());
        const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const totalPrice = diffDays * listing.price;

        const newBooking = new Booking({
            listing: listingId,
            user: req.user._id,
            checkIn: ci,
            checkOut: co,
            guests,
            totalPrice
        });

        await newBooking.save();
        res.status(201).json({ message: "Booking confirmed!", booking: newBooking });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create booking." });
    }
});

// Get user's bookings
router.get("/user", isLoggedIn, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id }).populate("listing").sort({ checkIn: 1 });
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch your bookings." });
    }
});

// Get bookings for a specific listing (to block out dates)
router.get("/listing/:id", async (req, res) => {
    try {
        const bookings = await Booking.find({ listing: req.params.id, status: "confirmed" });
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch listing bookings." });
    }
});

// Cancel a booking
router.patch("/:id/cancel", isLoggedIn, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ error: "Booking not found" });

        // Ensure user owns the booking
        if (!booking.user.equals(req.user._id)) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        // Optional: Ensure it's not already cancelled or completed
        if (booking.status === "cancelled") {
            return res.status(400).json({ error: "Booking is already cancelled" });
        }

        booking.status = "cancelled";
        await booking.save();
        res.json({ message: "Booking cancelled successfully", booking });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to cancel booking." });
    }
});

// Delete a booking
router.delete("/:id", isLoggedIn, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ error: "Booking not found" });

        // Ensure user owns the booking
        if (!booking.user.equals(req.user._id)) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: "Booking removed successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to remove booking." });
    }
});

module.exports = router;
