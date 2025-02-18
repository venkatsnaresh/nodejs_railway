const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../models/database");

// **Use a different secret for master admins**
const MASTER_ADMIN_SECRET = process.env.MASTER_ADMIN_SECRET || "your_super_strong_master_secret";

// **Generate Master Admin Token**
const generateMasterAdminToken = (masterAdminId) => {
    return jwt.sign({ id: masterAdminId, role: "master_admin" }, MASTER_ADMIN_SECRET, { expiresIn: "2h" });
};

// **Verify Master Admin Token Middleware**
const verifyMasterAdminToken = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), MASTER_ADMIN_SECRET);
        if (decoded.role !== "master_admin") {
            return res.status(403).json({ error: "Forbidden: Master Admin access required." });
        }
        req.masterAdmin = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: "Invalid token." });
    }
};

module.exports = { generateMasterAdminToken, verifyMasterAdminToken };
