
import express from 'express';
const router = express.Router();
import * as accountService from '../account-service.js';

// --- USER AUTHENTICATION ENDPOINTS ---

/**
 * POST /api/users/register
 * Purpose: Registers a new user account.
 * Body: { name: string, email: string, password: string }
 */
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    // Basic input validation
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields (name, email, password) are required." });
    }

    try {
        const result = await accountService.registerUser({ name, email, password });

        if (result.success) {
            // Success response should typically return the created user's ID
            res.status(201).json({ 
                success: true, 
                message: "Registration successful!",
                user: { id: result.userId, name, email } 
            });
        } else {
            // Handle registration errors (e.g., email already exists)
            res.status(409).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ success: false, message: "Server error during registration." });
    }
});

/**
 * POST /api/users/login
 * Purpose: Authenticates a user and returns their data.
 * Body: { email: string, password: string }
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    try {
        const result = await accountService.loginUser({ email, password });

        if (result.success) {
            // CRITICAL: Ensure the response structure matches what the frontend expects:
            // { success, message, user: { id, name, email } }
            res.status(200).json({ 
                success: true, 
                message: "Login successful!", 
                user: result.user // result.user should contain { id, name, email }
            });
        } else {
            // Invalid credentials
            res.status(401).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Server error during login." });
    }
});


/*
app.post('/api/users/confirm', async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ message: 'Missing email or confirmation code.' });
    }

    try {
        // Call the engine function to handle logic and database update
        const result = await confirmRegistration(email, code);

        res.status(result.success ? 200 : 400).json(result);

    } catch (error) {
        console.error('Server error in /api/users/confirm:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error.' });
    }
});

app.post('/api/invites/answer', async (req, res) => {
    // Expecting the inviter's email, the match ID, and the action ('accept' or 'reject')
    const { recipientEmail, matchId, action } = req.body; 

    if (!recipientEmail || !matchId || (action !== 'accept' && action !== 'reject')) {
        return res.status(400).json({ 
            message: 'Missing required fields (recipientEmail, matchId) or invalid action (must be "accept" or "reject").' 
        });
    }

    try {
        // Call the engine function to handle the logic and database update
        const result = await answerInvite(recipientEmail, matchId, action);

        if (result.success) {
            res.status(200).json(result);
        } else {
            // Failure, usually due to bad ID or invalid recipient
            res.status(400).json(result); 
        }

    } catch (error) {
        console.error('Server error in /api/invites/answer:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error.' });
    }
});

app.post('/api/users/invite', async (req, res) => {
    // We now expect the unique 12-character hidden key (senderId) instead of senderEmail.
    const { senderId, recipientEmail } = req.body; 

    if (!senderId || !recipientEmail) {
        return res.status(400).json({ message: 'Missing sender ID or recipient email.' });
    }

    try {
        // The engine function must now handle authentication verification internally
        const result = await inviteUser(senderId, recipientEmail); 
        // Note: inviteUser now takes senderId instead of senderEmail

        if (result.success) {
            res.status(200).json(result);
        } else {
            // Use 401 Unauthorized if the sender ID check failed inside the engine
            const status = result.message.includes('Sender not found') ? 401 : 400;
            res.status(status).json(result);
        }

    } catch (error) {
        console.error('Server error in /api/users/invite:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error.' });
    }
});*/

export default router; // Use default export