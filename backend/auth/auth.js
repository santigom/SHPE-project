const jwt = require('jsonwebtoken');

// returns the decoded token (what it holds), or null if the token is expired, bad, or missing
function getUserFromToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return null;
    }
}

module.exports = { getUserFromToken };