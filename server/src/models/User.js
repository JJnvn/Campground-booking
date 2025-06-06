const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, default: "default_name" },
        email: { type: String, unique: true },
        password: String,
        telephone: String,
        role: { type: String, enum: ["user", "admin"], default: "user" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
