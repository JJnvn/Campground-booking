const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        campground: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Campground",
            required: true,
        },
        startDate: { type: Date, required: true },
        nights: { type: Number, required: true, min: 1, max: 3 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
