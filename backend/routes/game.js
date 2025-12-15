
import express from 'express';
const router = express.Router();
import * as gameEngine from '../game-engine.js';

// Middleware to sanitize GameState before sending (removes secret Menace)
const sanitizeGameState = (game) => {
    if (!game) return null;
    const safeGameState = { ...game };
    // CRITICAL: Ensure the secret Menace is never exposed unless discovered
    if (!safeGameState.isMenaceDiscovered) {
        delete safeGameState.menace;
    }
    return safeGameState;
};

// --- 1. LOBBY & SETUP ENDPOINTS ---

/**
 * POST /api/game/create
 * Purpose: Host creates a new game session.
 * Body: { hostId: string }
 */
router.post('/create', (req, res) => {
    const { hostId } = req.body;
    if (!hostId) {
        return res.status(400).json({ message: "Host ID is required to create a game." });
    }
    
    const result = gameEngine.createGame(hostId);
    res.status(result.status).json(result);
});

/**
 * POST /api/game/join/:code
 * Purpose: Player joins an existing session.
 * Body: { userId: string }
 */
router.post('/join/:code', (req, res) => {
    const { code } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
        return res.status(400).json({ message: "User ID is required to join a game." });
    }

    const result = gameEngine.joinGame(code, userId);
    res.status(result.status).json(result);
});

/**
 * GET /api/game/lobby/:code
 * Purpose: Get the current players and lobby status (pre-start).
 */
router.get('/lobby/:code', (req, res) => {
    const { code } = req.params;
    const result = gameEngine.getLobbyStatus(code);
    res.status(result.status).json(result);
});

/**
 * POST /api/game/start/:code
 * Purpose: Host starts the game, triggering initialization.
 * Body: { hostId: string }
 */
router.post('/start/:code', (req, res) => {
    const { code } = req.params;
    const { hostId } = req.body;
    
    const result = gameEngine.startGame(code, hostId);
    
    if (result.status === 200) {
        // As agreed, return only the success message and game code, not the full state.
        res.status(200).json({ 
            message: "Game started successfully. Fetching initial state...",
            gameCode: code 
        });
    } else {
        res.status(result.status).json(result);
    }
});

// --- 2. GAME STATE & CONTROL ENDPOINTS ---

/**
 * GET /api/game/state/:code
 * Purpose: Get the safe current game state for client synchronization.
 */
router.get('/state/:code', (req, res) => {
    const { code } = req.params;
    const game = gameEngine.GAMES[code]; // Accessing the live game state

    if (!game) { 
        return res.status(404).json({ message: "Game not found." }); 
    }
    
    // Use the sanitizer function before responding
    const safeGameState = sanitizeGameState(game);

    res.status(200).json({ gameState: safeGameState });
});

export default router; // Use default export