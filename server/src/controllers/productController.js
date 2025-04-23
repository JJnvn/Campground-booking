const Booking = require("../models/Booking");
const Campground = require("../models/Campground");
const { validatePagination } = require("../utils/validationHelpers");
const logger = require("../utils/logger");
// const User = require("../models/User");

exports.getAllProducts = async (req, res) => {
    let query;
    const reqQuery = { ...req.query };
    const removeFields = ["select", "sort", "page", "limit"];
    removeFields.forEach((param) => delete reqQuery[param]);

    // Advanced filtering
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(
        /\b(gt|gte|lt|lte|in)\b/g,
        (match) => `$${match}`
    );

    try {
        query = Campground.find(JSON.parse(queryStr)).populate("booking");

        // Field selection
        if (req.query.select) {
            const fields = req.query.select.split(",").join(" ");
            query = query.select(fields);
        }

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
        } else {
            query = query.sort("-createdAt");
        }

        // Validate and apply pagination
        const paginationParams = validatePagination(req.query);
        if (!paginationParams) {
            logger.warn("Invalid pagination query:", req.query);
            return res
                .status(400)
                .json({ message: "Invalid pagination parameters" });
        }

        const { page, limit } = paginationParams;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Campground.countDocuments();

        query = query.skip(startIndex).limit(limit);

        const campground = await query;

        const pagination = {};
        if (endIndex < total) {
            pagination.next = { page: page + 1, limit };
        }
        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }

        logger.info(`Fetched ${campground.length} campgrounds - Page ${page}`);

        res.status(200).json({
            success: true,
            count: campground.length,
            pagination,
            data: campground,
        });
    } catch (err) {
        logger.error(`Error fetching campgrounds: ${err.message}`);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const campground = await Campground.findById(id);

        if (!campground) {
            logger.warn(`Campground not found for ID: ${id}`);
            return res
                .status(404)
                .json({ success: false, message: "Campground not found" });
        }

        logger.info(`Campground retrieved with ID: ${id}`);
        res.status(200).json({ success: true, data: campground });
    } catch (error) {
        logger.error(
            `Error retrieving campground by ID ${id}: ${error.message}`
        );
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.createProduct = async (req, res) => {
    const { name, price, description, location } = req.body;

    if (!name || !price || !description || !location) {
        logger.warn("Product creation failed: Missing required fields");
        return res.status(400).json({
            success: false,
            message:
                "Missing required fields: name, price, description, location",
        });
    }

    try {
        const campground = await Campground.create(req.body);
        logger.info(`Product created successfully with ID: ${campground._id}`);
        res.status(201).json({ success: true, data: campground });
    } catch (error) {
        logger.error(`Error creating product: ${error.message}`);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.updateProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const campground = await Campground.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!campground) {
            logger.warn(`Product not found for update with ID: ${id}`);
            return res
                .status(404)
                .json({ success: false, message: "Product not found" });
        }

        logger.info(`Product updated successfully with ID: ${id}`);
        res.status(200).json({ success: true, data: campground });
    } catch (error) {
        logger.error(`Error updating product ID ${id}: ${error.message}`);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const campground = await Campground.findById(id);

        if (!campground) {
            logger.warn(
                `Attempt to delete non-existent product with ID: ${id}`
            );
            return res
                .status(404)
                .json({ success: false, message: "Product not found" });
        }

        await Booking.deleteMany({ campground: id });
        await Campground.deleteOne({ _id: id });

        logger.info(
            `Product deleted successfully with ID: ${id} and related bookings removed`
        );
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        logger.error(`Error deleting product ID ${id}: ${error.message}`);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
