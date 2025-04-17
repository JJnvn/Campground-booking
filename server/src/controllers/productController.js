const Booking = require("../models/Booking");
const Campground = require("../models/Campground");
const User = require("../models/User");

exports.getAllProducts = async (req, res) => {
    //var

    try {
        console.log("getAllProduct");
    } catch {
        console.log("error");
    }
};

exports.getProductById = async (req, res) => {
    const id = req.params("id");

    try {
        console.log("getAllProduct");
    } catch {
        console.log("error");
    }
};

exports.createProduct = async (req, res) => {
    try {
        console.log("create product");
    } catch {
        console.log("error");
    }
};

exports.updateProduct = async (req, res) => {
    try {
        console.log("update product");
    } catch {
        console.log("error");
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        console.log("delete product");
    } catch {
        console.log("error");
    }
};
