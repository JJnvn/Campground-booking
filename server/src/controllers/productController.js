const Booking = require("../models/Booking");
const Campground = require("../models/Campground");
// const User = require("../models/User");

exports.getAllProducts = async (req, res) => {
  let query;
  const reqQuery = { ...req.query };
  const removeFields = ["select", "sort", "page", "limit"];
  removeFields.forEach((param) => delete reqQuery[param]);
  console.log(reqQuery);
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );
  query = Campground.find(JSON.parse(queryStr)).populate("booking");
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }
  }
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Campground.countDocuments();
  query = query.skip(startIndex).limit(limit);
  try {
    const campground = await query;
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }
    res.status(200).json({
      success: true,
      count: campground.length,
      pagination,
      data: campground,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const campground = await Campground.findById(req.params.id);

    if (!campground) {
      return res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: campground });
  } catch {
    res.status(400).json({ success: false });
  }
};

exports.createProduct = async (req, res) => {
  const campground = await Campground.create(req.body);
  res.status(201).json({ success: true, data: campground });
};

exports.updateProduct = async (req, res) => {
  try {
    const campground = await Campground.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!campground) {
      return res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: campground });
  } catch {
    return res.status(400).json({ success: false });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      return res.status(400).json({ success: false });
    }
    await Booking.deleteMany({ campground: req.params.id });
    await Campground.deleteOne({ _id: req.params.id });
    res.status(200).json({ success: true, data: {} });
  } catch {
    res.status(400).json({ success: false });
  }
};
