const mongoose = require("mongoose");

const campgroundSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  telephone: { type: String, required: true },
});

campgroundSchema.virtual("booking", {
  ref: "Booking",
  localField: "_id",
  foreignField: "campground",
  justOne: false,
});

module.exports = mongoose.model("Campground", campgroundSchema);
