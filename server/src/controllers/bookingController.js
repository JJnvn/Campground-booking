const Booking = require("../models/Booking");
const Campground = require("../models/Campground");
const User = require("../models/User");
const logger = require("../utils/logger");
const mongoose = require("mongoose");
const {
    validatePagination,
    validateObjectId,
} = require("../utils/validationHelpers");

exports.getAllBookings = async (req, res) => {
    const { page, limit } = validatePagination(req.query);
    if (!page || !limit) {
        logger.warn(
            `Invalid pagination params: page=${req.query.page}, limit=${req.query.limit}`
        );
        return res
            .status(400)
            .json({ message: "Invalid pagination parameters" });
    }
    const offset = (page - 1) * limit;

    try {
        const bookings = await Booking.find({ user: req.user.id }) // only user's bookings
            .populate("user")
            .populate("campground")
            .limit(limit)
            .skip(offset);

        const total = await Booking.countDocuments({ user: req.user.id });

        logger.info(
            `User ${req.user.id} fetched bookings: page=${page}, limit=${limit}`
        );
        res.status(200).json({
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            bookings,
        });
    } catch (error) {
        logger.error(`Error get all bookings: ${error.message}`);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getBookingsById = async (req, res) => {
    const { id } = req.params;

    if (!validateObjectId(id)) {
        logger.warn(`Invalid ObjectId provided: ${id}`);
        return res.status(400).json({ message: "Invalid booking ID format" });
    }

    logger.info(`Fetching booking with ID: ${id} for user ID: ${req.user.id}`);

    try {
        const booking = await Booking.findOne({ _id: id, user: req.user.id }) // secure find
            .populate("user")
            .populate("campground");

        if (!booking) {
            logger.warn(`Booking not found or not authorized: ${id}`);
            return res
                .status(404)
                .json({ message: "Booking not found or not authorized" });
        }

        logger.info(`Successfully fetched booking: ${id}`);
        res.status(200).json(booking);
    } catch (error) {
        logger.error(`Error fetching booking by ID: ${error.message}`);
        res.status(500).json({ message: "Server error" });
    }
};

exports.createBooking = async (req, res) => {
    const { startDate, nights, campgroundName } = req.body;

    try {
        const campground = await Campground.findOne({ name: campgroundName });
        if (!campground) {
            logger.warn(`Campground not found: ${campgroundName}`);
            return res.status(404).json({ message: "Campground not found" });
        }

        const newBooking = new Booking({
            user: req.user.id,
            campground: campground._id,
            startDate,
            nights,
        });

        await newBooking.save();

        logger.info(`New booking created by user ${req.user.id}`);
        res.status(201).json({
            message: "Booking created successfully",
            booking: newBooking,
        });
    } catch (error) {
        logger.error(`Error creating booking: ${error.message}`);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateBooking = async (req, res) => {
    const { id } = req.params;
    const { startDate, nights, campgroundName } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        logger.warn(`Invalid booking ID for update: ${id}`);
        return res.status(400).json({ message: "Invalid booking ID" });
    }

    // Basic input validation
    if (!startDate || !nights || !campgroundName) {
        logger.warn(`Missing fields in update request by user ${req.user?.id}`);
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const booking = await Booking.findOne({
            _id: id,
            user: req.user.id,
        })
            .populate("user")
            .populate("campground");

        if (!booking) {
            logger.warn(
                `Booking not found or unauthorized access by user ${req.user.id} for booking ${id}`
            );
            return res
                .status(404)
                .json({ message: "Booking not found or not authorized" });
        }

        const campground = await Campground.findOne({ name: campgroundName });

        if (!campground) {
            logger.warn(
                `Campground "${campgroundName}" not found for update by user ${req.user.id}`
            );
            return res.status(404).json({ message: "Campground not found" });
        }

        booking.campground = campground._id;
        booking.startDate = startDate;
        booking.nights = nights;

        await booking.save();

        logger.info(
            `Booking updated successfully by user ${req.user.id}: booking ID ${id}`
        );

        res.status(200).json({
            message: "Booking updated successfully",
            booking,
        });
    } catch (error) {
        logger.error(`Error updating booking ${id}: ${error.message}`);
        res.status(500).json({ message: "Server error" });
    }
};

exports.deleteBooking = async (req, res) => {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        logger.warn(`Invalid booking ID for deletion: ${id}`);
        return res.status(400).json({ message: "Invalid booking ID" });
    }

    try {
        const booking = await Booking.findOne({
            _id: id,
            user: req.user.id,
        });

        if (!booking) {
            logger.warn(
                `Booking not found or unauthorized delete attempt by user ${req.user.id} for booking ${id}`
            );
            return res
                .status(404)
                .json({ message: "Booking not found or not authorized" });
        }

        await booking.deleteOne();

        logger.info(
            `Booking deleted successfully by user ${req.user.id}: booking ID ${id}`
        );

        res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
        logger.error(`Error deleting booking ${id}: ${error.message}`);
        res.status(500).json({ message: "Server error" });
    }
};

//admin function
exports.getAllBookingsAdmin = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    if (page < 1 || limit < 1) {
        logger.warn(`Invalid pagination params: page=${page}, limit=${limit}`);
        return res
            .status(400)
            .json({ message: "Invalid pagination parameters" });
    }

    const offset = (page - 1) * limit;

    try {
        const bookings = await Booking.find()
            .populate("user")
            .populate("campground")
            .limit(limit)
            .skip(offset);

        const total = await Booking.countDocuments();

        logger.info(
            `Admin ${req.user?.id} retrieved bookings: page=${page}, limit=${limit}`
        );

        res.status(200).json({
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            bookings,
        });
    } catch (error) {
        logger.error(`Error fetching all bookings (admin): ${error.message}`);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getBookingsByIdAdmin = async (req, res) => {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        logger.warn(
            `Invalid booking ID requested by admin ${req.user?.id}: ${id}`
        );
        return res.status(400).json({ message: "Invalid booking ID" });
    }

    try {
        const booking = await Booking.findById(id)
            .populate("user")
            .populate("campground");

        if (!booking) {
            logger.warn(`Booking not found for admin ${req.user?.id}: ${id}`);
            return res.status(404).json({ message: "Booking not found" });
        }

        logger.info(`Admin ${req.user?.id} retrieved booking with ID: ${id}`);

        res.status(200).json(booking);
    } catch (error) {
        logger.error(
            `Error fetching booking with ID ${id} (admin): ${error.message}`
        );
        res.status(500).json({ message: "Server error" });
    }
};

exports.createBookingAdmin = async (req, res) => {
    const { email, startDate, nights, campgroundName } = req.body;

    // Validate required fields
    if (!email || !startDate || !nights || !campgroundName) {
        logger.warn(
            `Missing required fields in booking creation request by admin ${req.user?.id}`
        );
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        // Validate if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            logger.warn(
                `User with email ${email} not found for booking creation by admin ${req.user?.id}`
            );
            return res.status(404).json({ message: "User not found" });
        }

        // Validate if the campground exists
        const campground = await Campground.findOne({ name: campgroundName });
        if (!campground) {
            logger.warn(
                `Campground with name ${campgroundName} not found for booking creation by admin ${req.user?.id}`
            );
            return res.status(404).json({ message: "Campground not found" });
        }

        // Create a new booking
        const newBooking = new Booking({
            user: user._id,
            campground: campground._id,
            startDate,
            nights,
        });

        await newBooking.save();

        logger.info(
            `Booking created successfully by admin ${req.user?.id} for user ${user._id} at campground ${campground._id}`
        );

        res.status(201).json({
            message: "Booking created successfully",
            booking: newBooking,
        });
    } catch (error) {
        logger.error(`Error creating booking: ${error.message}`);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateBookingAdmin = async (req, res) => {
    const { bookingId } = req.params;
    const { email, startDate, nights, campgroundName } = req.body;

    // Validate ObjectId for bookingId
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        logger.warn(`Invalid booking ID for update: ${bookingId}`);
        return res.status(400).json({ message: "Invalid booking ID" });
    }

    // Validate required fields
    if (!email || !startDate || !nights || !campgroundName) {
        logger.warn(
            `Missing required fields in booking update request by admin ${req.user?.id}`
        );
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        // Find the booking
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            logger.warn(
                `Booking with ID ${bookingId} not found for update by admin ${req.user?.id}`
            );
            return res.status(404).json({ message: "Booking not found" });
        }

        // Find the user associated with the email
        const user = await User.findOne({ email });
        if (!user) {
            logger.warn(
                `User with email ${email} not found for booking update by admin ${req.user?.id}`
            );
            return res.status(404).json({ message: "User not found" });
        }

        // Find the campground by name
        const campground = await Campground.findOne({ name: campgroundName });
        if (!campground) {
            logger.warn(
                `Campground with name ${campgroundName} not found for booking update by admin ${req.user?.id}`
            );
            return res.status(404).json({ message: "Campground not found" });
        }

        // Update the booking
        booking.user = user._id;
        booking.campground = campground._id;
        booking.startDate = startDate;
        booking.nights = nights;

        await booking.save();

        logger.info(
            `Booking updated successfully by admin ${req.user?.id}: booking ID ${bookingId}`
        );

        res.status(200).json({
            message: "Booking updated successfully",
            booking,
        });
    } catch (error) {
        logger.error(`Error updating booking ${bookingId}: ${error.message}`);
        res.status(500).json({ message: "Server error" });
    }
};

exports.deleteBookingAdmin = async (req, res) => {
    const { bookingId } = req.params;

    // Validate ObjectId for bookingId
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        logger.warn(`Invalid booking ID for deletion: ${bookingId}`);
        return res.status(400).json({ message: "Invalid booking ID" });
    }

    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            logger.warn(
                `Booking with ID ${bookingId} not found for deletion by admin ${req.user?.id}`
            );
            return res.status(404).json({ message: "Booking not found" });
        }

        await booking.deleteOne(); // or booking.remove()

        logger.info(
            `Booking with ID ${bookingId} deleted successfully by admin ${req.user?.id}`
        );

        res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
        logger.error(`Error deleting booking ${bookingId}: ${error.message}`);
        res.status(500).json({ message: "Server error" });
    }
};
