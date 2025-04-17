const Booking = require("../models/Booking");
const Campground = require("../models/Campground");
const User = require("../models/User");

exports.getAllBookings = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    try {
        const bookings = await Booking.find({ user: req.user.id }) // only user's bookings
            .populate("user")
            .populate("campground")
            .limit(limit)
            .skip(offset);

        const total = await Booking.countDocuments({ user: req.user.id });

        res.status(200).json({
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            bookings,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getBookingsById = async (req, res) => {
    const { id } = req.params;

    try {
        const booking = await Booking.findOne({ _id: id, user: req.user.id }) // secure find
            .populate("user")
            .populate("campground");

        if (!booking) {
            return res
                .status(404)
                .json({ message: "Booking not found or not authorized" });
        }

        res.status(200).json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.createBooking = async (req, res) => {
    const { startDate, nights, campgroundName } = req.body;

    try {
        const campground = await Campground.findOne({ name: campgroundName });
        if (!campground) {
            return res.status(404).json({ message: "Campground not found" });
        }

        const newBooking = new Booking({
            user: req.user.id, // directly from token
            campground: campground._id,
            startDate,
            nights,
        });

        await newBooking.save();

        res.status(201).json({
            message: "Booking created successfully",
            booking: newBooking,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateBooking = async (req, res) => {
    const { bookingId } = req.params;
    const { startDate, nights, campgroundName } = req.body;

    try {
        const booking = await Booking.findOne({
            _id: bookingId,
            user: req.user.id,
        }); // secure query
        if (!booking) {
            return res
                .status(404)
                .json({ message: "Booking not found or not authorized" });
        }

        const campground = await Campground.findOne({ name: campgroundName });
        if (!campground) {
            return res.status(404).json({ message: "Campground not found" });
        }

        booking.campground = campground._id;
        booking.startDate = startDate;
        booking.nights = nights;

        await booking.save();

        res.status(200).json({
            message: "Booking updated successfully",
            booking,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.deleteBooking = async (req, res) => {
    const { bookingId } = req.params;

    try {
        const booking = await Booking.findOne({
            _id: bookingId,
            user: req.user.id,
        }); // secure
        if (!booking) {
            return res
                .status(404)
                .json({ message: "Booking not found or not authorized" });
        }

        await booking.deleteOne();

        res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

//admin function
exports.getAllBookingsAdmin = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Current page (default 1)
    const limit = parseInt(req.query.limit) || 5; // Bookings per page (default 10)
    const offset = (page - 1) * limit;

    try {
        const bookings = await Booking.find()
            .populate("user")
            .populate("campground")
            .limit(limit)
            .skip(offset);

        const total = await Booking.countDocuments(); // total number of bookings

        res.status(200).json({
            total,
            page, // current page
            limit, // number per page
            totalPages: Math.ceil(total / limit),
            bookings, // paginated bookings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getBookingsByIdAdmin = async (req, res) => {
    const { id } = req.params;

    try {
        const booking = await Booking.findById(id)
            .populate("user")
            .populate("campground");

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.createBookingAdmin = async (req, res) => {
    const { email, startDate, nights, campgroundName } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const campground = await Campground.findOne({ name: campgroundName });
        if (!campground) {
            return res.status(404).json({ message: "Campground not found" });
        }

        const newBooking = new Booking({
            user: user._id,
            campground: campground._id,
            startDate,
            nights,
        });

        await newBooking.save();

        res.status(201).json({
            message: "Booking created successfully",
            booking: newBooking,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateBookingAdmin = async (req, res) => {
    const { bookingId } = req.params;
    const { email, startDate, nights, campgroundName } = req.body;

    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const campground = await Campground.findOne({ name: campgroundName });
        if (!campground) {
            return res.status(404).json({ message: "Campground not found" });
        }

        booking.user = user._id;
        booking.campground = campground._id;
        booking.startDate = startDate;
        booking.nights = nights;

        await booking.save();

        res.status(200).json({
            message: "Booking updated successfully",
            booking,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.deleteBookingAdmin = async (req, res) => {
    const { bookingId } = req.params;

    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        await booking.deleteOne(); // or booking.remove()

        res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
