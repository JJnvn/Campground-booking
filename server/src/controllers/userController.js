const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
    const { username, email, password, telephone } = req.body;

    try {
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            telephone,
            role: "user",
        });
        await newUser.save();

        res.status(201).json({
            message: "User registered successfully",
            user: {
                username: newUser.username,
                email: newUser.email,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(400)
                .json({ message: "Invalid username or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res
                .status(400)
                .json({ message: "Invalid username or password" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h",
            }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60, // ms
            sameSite: "strict",
        });

        res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                username: user.username,
                email: user.email,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.logoutUser = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        res.status(200).json({ message: "Logout successful" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

//admin function
exports.registerAdmin = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new admin user
        const newAdmin = new User({
            name,
            email,
            password: hashedPassword,
            role: "admin",
        });

        await newAdmin.save();

        res.status(201).json({ message: "Admin registered successfully" });
    } catch (error) {
        console.error("Error registering admin:", error);
        res.status(500).json({ message: "Server error" });
    }
};
