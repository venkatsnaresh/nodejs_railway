const jwt = require("jsonwebtoken");

// Secret Key
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key"; 

// Generate Admin Token (No Role Check)
const generateAdminToken = (adminId) => {
    return jwt.sign({ id: adminId }, SECRET_KEY, { expiresIn: "2h" });
};

// Middleware to Verify Admin Token
const verifyAdminToken = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), SECRET_KEY);
        req.admin = decoded; // Store admin data in req
        next();
    } catch (error) {
        res.status(400).json({ error: "Invalid token." });
    }
};

// Export functions
module.exports = {
    generateAdminToken,
    verifyAdminToken
};
