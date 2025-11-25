import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { createNewUserRecord } from './account-service.js';
import { confirmRegistration } from './account-service.js';
import { inviteUser } from './account-service.js';
import { answerInvite } from './account-service.js';
import { authenticateUser } from './account-service.js';

const app = express();
const PORT = 3001;
const JSON_SERVER_URL = process.env.JSON_SERVER_URL;

if (!JSON_SERVER_URL) {
    console.error("FATAL ERROR: JSON_SERVER_URL is not set");
    process.exit(1);
}

app.use(cors());
app.use(express.json());

app.get('/api/games/count', async (req, res) => {
    console.log('Counting active games...');
    try {
        const response = await axios.get(`${JSON_SERVER_URL}/games`);
        const allGames = response.data;
        
        const activeGames = allGames.filter(game => game.status === 'active');
        const activeGameCount = activeGames.length;

        res.json({ 
            count: activeGameCount,
            message: `There are ${activeGameCount} active games.`
        });
    } catch (error) {
        console.error('Error counting games:', error.message);
        res.status(500).json({ message: 'Error communicating with data server' });
    }
});

app.post('/api/users/register', async (req, res) => {
    const { name, email, country, password } = req.body;

    if (!name || !email || !country || !password) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        // 1. Create the new secure user record (password is hashed here)
        const newUser = await createNewUserRecord(name, email, country, password);

        // 2. Save the record to json-server (assuming a 'users' collection)
        const response = await axios.post(`${JSON_SERVER_URL}/users`, newUser);

        // 3. Send back only safe info (e.g., status, confirmation message)
        res.status(201).json({ 
            message: 'Registration successful! Check email for confirmation code.',
            userId: response.data.id,
            // NOTE: Never send back the password hash or the confirmation code.
        });

    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

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
});

app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Missing email or password.' });
    }

    try {
        // Call the engine function to handle authentication
        const result = await authenticateUser(email, password);

        if (result.success) {
            // Success: 200 OK. Return user data (without password hash)
            res.status(200).json(result);
        } else {
            // Failure: 401 Unauthorized (for security errors) or 400 Bad Request
            const status = result.message.includes("status") ? 400 : 401;
            res.status(status).json(result); 
        }

    } catch (error) {
        console.error("DEBUG AUTHENTICATION ERROR:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error.' });
    }
});

app.listen(PORT, () => {
    console.log(`Main Game Server running on port ${PORT}`);
});