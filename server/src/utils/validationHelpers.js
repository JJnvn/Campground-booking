const logger = require("../utils/logger");

/**
 * Validates pagination parameters (page and limit).
 * @param {object} query - The query parameters from the request.
 * @returns {object} - Returns { page, limit } with default values if invalid.
 */
function validatePagination(query) {
    const page = parseInt(query.page);
    const limit = parseInt(query.limit);

    if (isNaN(page) || page < 1) {
        logger.warn(
            `Invalid page parameter: ${query.page}. Defaulting to page 1.`
        );
        return { page: 1, limit: 5 };
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
        logger.warn(
            `Invalid limit parameter: ${query.limit}. Defaulting to limit 5.`
        );
        return { page: 1, limit: 5 };
    }

    return { page, limit };
}

/**
 * Validates an ObjectId in the query string (for example, for MongoDB).
 * @param {string} id - The ID to validate.
 * @returns {boolean} - Returns true if the ID is valid, false otherwise.
 */
function validateObjectId(id) {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateRegisterInput({ username, email, password, telephone }) {
    if (!username || !email || !password || !telephone) {
        return { valid: false, message: "All fields are required" };
    }

    if (!validateEmail(email)) {
        return { valid: false, message: "Invalid email format" };
    }

    if (!validatePassword(password)) {
        return {
            valid: false,
            message: "Password must be at least 6 characters long",
        };
    }

    return { valid: true };
}

function validateLoginInput({ email, password }) {
    if (!email || !password) {
        return { valid: false, message: "Email and password are required" };
    }

    if (!isValidEmail(email)) {
        return { valid: false, message: "Invalid email format" };
    }

    return { valid: true };
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return typeof password === "string" && password.length >= 6;
}

module.exports = {
    validatePagination,
    validateObjectId,
    validateRegisterInput,
    validateLoginInput,
    validateEmail,
    validatePassword,
};
