const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const {
    validateRegisterInput,
    validateLoginInput,
    validateEmail,
    validatePassword,
} = require("../utils/validationHelpers");

exports.registerUser = async (req, res) => {
    const { username, email, password, telephone } = req.body;

    if (!username || !email || !password || !telephone) {
        logger.warn("Register User : Missing required fields");
        return res.status(400).json({ message: "All fields are required" });
    }

    if (!validateEmail(email)) {
        logger.warn(`Register User: Invalid email format (${email})`);
        return res.status(400).json({ message: "Invalid email format" });
    }

    if (!validatePassword(password)) {
        logger.warn("Register User: Weak or Invalid password");
        return res
            .status(400)
            .json({ message: "Password must be at least 6 characters" });
    }

    try {
        const userExist = await User.findOne({ email });
        if (userExist) {
            logger.warn(`Registration attempt with existing email: ${email}`);
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

        logger.info(`New user registered: ${email}`);
        res.status(201).json({
            message: "User registered successfully",
            user: {
                username: newUser.username,
                email: newUser.email,
            },
        });
    } catch (err) {
        logger.error(`Registration error: ${err.message}`);
        res.status(500).json({ message: "Server error" });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    const { valid, message } = validateLoginInput({ email, password });
    if (!valid) {
        logger.warn(`Login validation failed: ${message}`);
        return res.status(400).json({ message });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            logger.warn(`Login failed: Email not found - ${email}`);
            return res
                .status(400)
                .json({ message: "Invalid username or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            logger.warn(`Login failed: Incorrect password for ${email}`);
            return res
                .status(400)
                .json({ message: "Invalid username or password" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60,
            sameSite: "strict",
        });

        logger.info(`User login successful: ${email} (role: ${user.role})`);

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                username: user.username,
                email: user.email,
            },
        });
    } catch (err) {
        logger.error(`Login error: ${err.message}`);
        res.status(500).json({ message: "Server error" });
    }
};

exports.logoutUser = async (req, res) => {
    try {
        let id = req.user?.id;
        let role = req.user?.role;

        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        if (id && role) {
            logger.info(`User logout: id=${id}, role=${role}`);
        } else {
            logger.warn("Logout attempted but user not authenticated");
        }
        res.status(200).json({ message: "Logout successful" });
    } catch (err) {
        logger.error(`Logout error: ${err.message}`);
        res.status(500).json({ message: "Server error" });
    }
};

//admin function
exports.registerAdmin = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        logger.warn("Register Admin: Missing required fields");
        return res.status(400).json({ message: "All fields are required" });
    }

    if (!validateEmail(email)) {
        logger.warn(`Register Admin: Invalid email format (${email})`);
        return res.status(400).json({ message: "Invalid email format" });
    }

    if (!validatePassword(password)) {
        logger.warn("Register Admin: Weak or invalid password");
        return res
            .status(400)
            .json({ message: "Password must be at least 6 characters" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            logger.warn(`Register Admin: Email already in use (${email})`);
            return res.status(400).json({ message: "Email already in use" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = new User({
            name,
            email,
            password: hashedPassword,
            role: "admin",
        });

        await newAdmin.save();

        logger.info(`Admin registered successfully: ${email}`);
        res.status(201).json({ message: "Admin registered successfully" });
    } catch (error) {
        logger.error(`Error registering admin: ${error.message}`);
        res.status(500).json({ message: "Server error" });
    }
};
