import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

import axios from 'axios';

import { generateRandomCode, hashPassword, comparePassword } from './utils.js';

const JSON_SERVER_URL = process.env.JSON_SERVER_URL;

if (!JSON_SERVER_URL) {
    console.error("FATAL ERROR: JSON_SERVER_URL is not set");
    process.exit(1);
}

// IMPORTANT: This is a simplified function to demonstrate hashing.
// In a real scenario, this function would handle the database interaction via axios.
export const createNewUserRecord = async (name, email, country, password) => {
    // 1. Hash the incoming password
    const hashedPassword = await hashPassword(password);
    
    // 2. Generate required codes/keys
    const id = generateRandomCode(12); // The hidden key
    const confirmationCode = generateRandomCode(5);
    
    // 3. Construct the record to be saved
    const newUserRecord = {
        id, // The unique 12-char key
        name,
        email,
        country,
        // *** STORE THE HASHED PASSWORD ***
        password: hashedPassword, 
        confirmationCode,
        status: 'pending',
    };
    
    return newUserRecord;
};

export const confirmRegistration = async (email, code) => {
    try { 
        const user = await findUserByEmail(email);

        if (!user) {
            return { success: false, message: 'User not found.' };
        }

        if (user.status !== 'pending') {
            return { success: false, message: 'User is already confirmed or banned.' };
        }

        // 2. Check the confirmation code
        if (user.confirmationCode !== code) {
            return { success: false, message: 'Invalid confirmation code.' };
        }

        // 3. Update the user status to 'confirmed'
        const updatedUser = { ...user, status: 'confirmed' };
        
        // Remove the confirmationCode as it's no longer needed
        delete updatedUser.confirmationCode; 

        // 4. PUT request to json-server to fully replace the user record
        const updateResponse = await axios.put(`${JSON_SERVER_URL}/users/${user.id}`, updatedUser);
        
        // Send a successful response back to the API route
        return { 
            success: true, 
            message: 'Registration confirmed successfully!',
            user: { 
                name: updateResponse.data.name,
                email: updateResponse.data.email,
                id: updateResponse.data.id
            }
        };

    } catch (error) {
        console.error('Error confirming registration:', error.message);
        return { success: false, message: 'Server error during confirmation.' };
    }
};

const findUserByEmail = async (email) => {
    try {
        // Query json-server for the user by email
        const userQuery = await axios.get(`${JSON_SERVER_URL}/users?email=${email}`);
        console.log("DEBUG findUserByEmail:", userQuery.data);
        return userQuery.data.length > 0 ? userQuery.data[0] : null;
    } catch (error) {
        console.error('Error fetching user by email:', error.message);
        return null;
    }
};

const findUserById = async (id) => {
    try {
        // Query json-server: GET /users/id
        const userQuery = await axios.get(`${JSON_SERVER_URL}/users/${id}`);
        return userQuery.data; 
    } catch (error) {
        // json-server returns 404 for not found
        return null;
    }
};

export const inviteUser = async (senderId, recipientEmail) => {
    
    // 1. Validate Sender (Authentication Check)
    const sender = await findUserById(senderId);
    
    if (!sender) {
        return { success: false, message: 'Sender ID not found or invalid (Authentication failed).' };
    }
    if (sender.status !== 'confirmed') {
        return { success: false, message: 'Sender not confirmed.' };
    }
    
    // Basic check: can't invite yourself (requires finding sender email first)
    if (sender.email === recipientEmail) {
        return { success: false, message: 'Cannot invite yourself to a match.' };
    }

    // 2. Check Recipient Status
    const recipient = await findUserByEmail(recipientEmail);

    if (recipient && recipient.status === 'confirmed') {
        // SCENARIO A: Recipient is a Confirmed User (Start a Match Invite)
        
        // Create a unique game ID
        const gameId = generateRandomCode(10); 
        
        // Construct the new match record
        const newMatch = {
            id: gameId,
            status: 'pending_invite',
            players: [
                { id: sender.id, email: sender.email, status: 'accepted' }, // Use ID and email
                { email: recipientEmail, status: 'pending' } 
            ],
            boardState: [], // Initial empty board
            createdAt: new Date().toISOString()
        };

        // Save the new match record to the 'games' collection (Port 3002)
        await axios.post(`${JSON_SERVER_URL}/games`, newMatch);
        
        // Simulate sending a match invitation email
        return { 
            success: true, 
            action: 'match_started',
            matchId: gameId,
            message: `Match invite sent to ${recipientEmail}. Waiting for their response.`
        };

    } else {
        // SCENARIO B: Recipient is Not Confirmed or Does Not Exist (Send Registration Invite)
        
        // Simulate sending a registration invitation email
        // In a real app, you might save an invite record here to prevent spamming
        return { 
            success: true, 
            action: 'registration_invite_sent',
            message: `User ${recipientEmail} is not registered. A registration invitation email was sent.`
        };
    }
};

export const answerInvite = async (recipientEmail, matchId, action) => {
    // 1. Validate Recipient
    const recipient = await findUserByEmail(recipientEmail);
    if (!recipient || recipient.status !== 'confirmed') {
        return { success: false, message: 'Recipient not confirmed or does not exist.' };
    }
    
    // 2. Fetch the Match Record
    let match;
    try {
        const response = await axios.get(`${JSON_SERVER_URL}/games/${matchId}`);
        match = response.data;
    } catch (error) {
        // json-server returns 404 if ID is not found
        return { success: false, message: 'Match not found.' };
    }

    if (match.status !== 'pending_invite') {
        return { success: false, message: 'Match is already active or finished.' };
    }

    // 3. Find and Update the Recipient's Player Status
    let playerUpdated = false;
    const updatedPlayers = match.players.map(player => {
        if (player.email === recipientEmail && player.status === 'pending') {
            playerUpdated = true;
            return { email: player.email, status: action === 'accept' ? 'accepted' : 'rejected' };
        }
        return player;
    });

    if (!playerUpdated) {
        return { success: false, message: 'You are not the pending invitee for this match.' };
    }
    
    // 4. Determine Match Status Update
    let newMatchStatus = match.status;
    let finalMessage;
    
    if (action === 'accept') {
        newMatchStatus = 'active'; // Match starts!
        finalMessage = 'Match accepted and is now active.';
    } else { // 'reject'
        newMatchStatus = 'rejected'; 
        finalMessage = 'Match invitation rejected.';
    }

    // 5. Update the Match Record in the Database
    const updatedMatch = { 
        ...match, 
        players: updatedPlayers,
        status: newMatchStatus,
        lastUpdated: new Date().toISOString()
    };
    
    // Use PUT to update the entire record on json-server
    await axios.put(`${JSON_SERVER_URL}/games/${matchId}`, updatedMatch);

    return { 
        success: true, 
        action: newMatchStatus,
        matchId,
        message: finalMessage
    };
};

export const authenticateUser = async (email, password) => {
    const user = await findUserByEmail(email); 

    if (!user) {
        // Use a generic message for security (don't reveal if the email exists)
        return { success: false, message: 'Invalid credentials or user not found.' };
    }

    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
        return { success: false, message: 'Invalid credentials or user not found.' };
    }

    if (user.status !== 'confirmed') {
        return { 
            success: false, 
            message: `User status is "${user.status}". Please confirm your email registration first.` 
        };
    }
    
    //Success
    return {
        success: true,
        message: 'Login successful!',
        user: { 
            id: user.id, 
            name: user.name, 
            email: user.email 
        }
    };
};