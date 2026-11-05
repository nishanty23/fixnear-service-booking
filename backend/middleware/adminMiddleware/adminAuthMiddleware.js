const {
    authenticateUser,
    authorizeRoles
} = require("../authMiddleware");

// Verify JWT and allow only ADMIN role
const authenticateAdmin = [
    authenticateUser,
    authorizeRoles("ADMIN")
];

module.exports = authenticateAdmin;
