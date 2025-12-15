import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

import express from 'express';
import cors from 'cors';
import gameRouter from './routes/game.js';
import userRouter from './routes/user.js';

const app = express();
const PORT = 3001;
const JSON_SERVER_URL = process.env.JSON_SERVER_URL;

if (!JSON_SERVER_URL) {
    console.error("FATAL ERROR: JSON_SERVER_URL is not set");
    process.exit(1);
}

app.use(cors());
app.use(express.json());

// --- ROUTES ---
app.use('/api/game', gameRouter); 
app.use('/api/users', userRouter);

app.listen(PORT, () => {
    console.log(`Main Game Server running on port ${PORT}`);
});