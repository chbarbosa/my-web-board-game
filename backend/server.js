// backend/server.js 
import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = 3001;
const JSON_SERVER_URL = 'http://localhost:3002';

app.use(cors());
app.use(express.json());

// --- NEW API ROUTE: Get Active Game Count ---
app.get('/api/games/count', async (req, res) => {
    console.log('Counting active games...');
    try {
        // 1. Fetch ALL gameStates from json-server
        const response = await axios.get(`${JSON_SERVER_URL}/games`);
        const allGames = response.data;
        
        // 2. Filter and Count the Active Games (The simple logic happens here)
        const activeGames = allGames.filter(game => game.status === 'active');
        const activeGameCount = activeGames.length;

        // 3. Send the result back to the frontend
        res.json({ 
            count: activeGameCount,
            message: `There are ${activeGameCount} active games.`
        });
    } catch (error) {
        console.error('Error counting games:', error.message);
        res.status(500).json({ message: 'Error communicating with data server' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Main Game Server running on port ${PORT}`);
});