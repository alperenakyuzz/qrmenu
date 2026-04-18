const JWT_SECRET = process.env.JWT_SECRET || 'qrmenu_super_secret_jwt_key_2024';
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

module.exports = { JWT_SECRET, PORT, CLIENT_URL };
