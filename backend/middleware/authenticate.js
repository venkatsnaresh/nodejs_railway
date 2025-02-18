const jwt = require("jsonwebtoken");

// Use environment variable for security
const JWT_SECRET = process.env.JWT_SECRET || "99599736746374637467364736473";  
const JWT_EXPIRATION = "1h"; // Set token expiration time

/**
 * Generates a JWT for a given user
 * @param {Object} user - The user object (should contain at least an id)
 * @returns {string} - The signed JWT token
 */
function generateToken(user) {
    return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

/**
 * Middleware to verify JWT token
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    
    if (!authHeader) {
        return res.status(403).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
        
        req.user = decoded; // Attach user details to request
        next();
    });
}

module.exports = { generateToken, authenticateToken };
