import bcrypt from 'bcrypt';
const SALT_ROUNDS = 10; // Standard security level for bcrypt

/**
 * Generates a random alphanumeric string for keys/codes.
 * @param {number} length - The desired length of the string.
 * @returns {string} The random string.
 */
export const generateRandomCode = (length) => {
    // Generate a secure, URL-safe random string
    return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
};

/**
 * Hashes a plaintext password using bcrypt.
 * @param {string} password - The user's plaintext password.
 * @returns {Promise<string>} The hashed password string.
 */
export const hashPassword = async (password) => {
    return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compares a plaintext password against a stored hash.
 * @param {string} password - The user's plaintext password.
 * @param {string} hash - The hashed password stored in the database.
 * @returns {Promise<boolean>} True if they match, false otherwise.
 */
export const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};