// --- STATIC DATA DEFINITIONS ---

export const GAMES = {}; 

const MENACES = ['Ghost', 'Werewolf', 'Assassin'];
const ROLES = ['Militar', 'Religious', 'Coward', 'Policeman', 'Hunter', 'Ghosthunter'];
const MAX_PLAYERS = 3; 

const INITIAL_ITEM_POOL = [
    'Adrenaline', 'Adrenaline', 'Old Newspaper', 'Old Newspaper', 
    'Gun', 'Regular Bullet', 'Silver Bullet', 
    'Paper w/ Ritual Start', 'Paper w/ Ritual End', 
    'Wood Plank', 'Wood Plank', 'Salt', 'Salt', 
    'Trap', 'Mystical Trap'
];

// This serves as the template for GameState.locationMap and adjacency check
const STATIC_LOCATION_MAP = {
    // STAGE 1
    "Front Door": { pool: "STAGE1", defenseAllowed: true, adjacentLocations: ["Front Lawn", "Stairwell", "Dining Room"] },
    "Dining Room": { pool: "STAGE1", defenseAllowed: true, adjacentLocations: ["Front Door", "Kitchen", "Library"] },
    "Kitchen": { pool: "STAGE1", defenseAllowed: true, adjacentLocations: ["Dining Room", "Servant Quarters"] },
    "Library": { pool: "STAGE1", defenseAllowed: true, adjacentLocations: ["Dining Room", "Design Studio", "Sitting Room"] },
    "Servant Quarters": { pool: "STAGE1", defenseAllowed: true, adjacentLocations: ["Kitchen", "Wine Cellar", "Master Bedroom"] },
    "Wine Cellar": { pool: "STAGE1", defenseAllowed: true, adjacentLocations: ["Servant Quarters", "Design Studio"] },
    "Design Studio": { pool: "STAGE1", defenseAllowed: true, adjacentLocations: ["Library", "Wine Cellar"] },
    "Sitting Room": { pool: "STAGE1", defenseAllowed: true, adjacentLocations: ["Library", "Stairwell"] },
    "Stairwell": { pool: "STAGE1", defenseAllowed: true, adjacentLocations: ["Front Door", "Sitting Room", "Office"] },
    
    // STAGE 2
    "Master Bedroom": { pool: "STAGE2", defenseAllowed: true, adjacentLocations: ["Servant Quarters", "Child Bedroom"] },
    "Child Bedroom": { pool: "STAGE2", defenseAllowed: true, adjacentLocations: ["Master Bedroom", "Visit Bedroom"] },
    "Visit Bedroom": { pool: "STAGE2", defenseAllowed: true, adjacentLocations: ["Child Bedroom", "Office"] },
    "Office": { pool: "STAGE2", defenseAllowed: true, adjacentLocations: ["Stairwell", "Visit Bedroom"] },
    
    // OUTSIDE
    "Front Lawn": { pool: "OUTSIDE", defenseAllowed: false, adjacentLocations: ["Front Door", "Back Garden"] },
    "Back Garden": { pool: "OUTSIDE", defenseAllowed: false, adjacentLocations: ["Front Lawn", "Workshop", "Lake Shore"] },
    "Workshop": { pool: "OUTSIDE", defenseAllowed: false, adjacentLocations: ["Back Garden", "Forest Entry"] },
    "Lake Shore": { pool: "OUTSIDE", defenseAllowed: false, adjacentLocations: ["Back Garden"] },
    "Forest Entry": { pool: "OUTSIDE", defenseAllowed: false, adjacentLocations: ["Workshop"] },
};

// --- UTILITY ---

// Simple unique ID generator for game codes
const generateGameCode = () => {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
};

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

// Function to initialize the GameState with initial lobby data
export const createGame = (hostId) => {
    const gameCode = generateGameCode();
    
    const newGame = {
        gameCode: gameCode,
        hostId: hostId, 
        dateCreated: new Date(),
        dateStarted: null,
        dateEnded: null,
        
        // Initial values - will be randomized in startGame()
        menace: null, 
        isMenaceDiscovered: false,
        turnNumber: 0, 
        timePeriod: 'Lobby',
        activePlayerId: hostId, // Host is initially the active player
        actionLog: [{ timestamp: new Date(), type: 'LOBBY', details: { message: 'Game created', host: hostId } }],
        locationMap: {}, // Empty until startGame()
        itemPool: [],    // Empty until startGame()

        players: [{ 
            id: hostId, 
            role: null, // Assigned in startGame()
            location: 'Front Door', 
            run: 0, 
            inventory: [], 
            isEliminated: false, 
            menaceAttacksSurvived: 0 
        }],
    };

    GAMES[gameCode] = newGame;
    return { status: 201, gameCode: gameCode };
};

// Function to add a player to the game
export const joinGame = (gameCode, userId) => {
    const game = GAMES[gameCode];
    
    if (!game) {
        return { status: 404, message: 'Game not found.' };
    }
    if (game.dateStarted) {
        return { status: 400, message: 'Game has already started.' };
    }
    if (game.players.length >= MAX_PLAYERS) {
        return { status: 400, message: 'Lobby is full.' };
    }
    if (game.players.some(p => p.id === userId)) {
        return { status: 400, message: 'Player already joined.' };
    }

    // Add new player to the game
    game.players.push({
        id: userId, 
        role: null,
        location: 'Front Door', 
        run: 0,
        inventory: [], 
        isEliminated: false, 
        menaceAttacksSurvived: 0
    });
    
    game.actionLog.push({ timestamp: new Date(), type: 'LOBBY', details: { message: `Player ${userId} joined.` } });

    return { status: 200, message: `Joined game ${gameCode}` };
};

// Function to retrieve lobby status (player list)
export const getLobbyStatus = (gameCode) => {
    const game = GAMES[gameCode];
    if (!game) {
        return { status: 404, message: 'Game not found.' };
    }
    return { 
        status: 200, 
        players: game.players.map(p => ({ id: p.id, role: p.role })), // Only return public info
        isReady: game.players.length === MAX_PLAYERS
    };
};

// Function to fully initialize the game state for play
export const startGame = (gameCode, hostId) => {
    const game = GAMES[gameCode];
    
    if (!game) { return { status: 404, message: 'Game not found.' }; }
    if (game.hostId !== hostId) { return { status: 403, message: 'Only the host can start the game.' }; }
    if (game.players.length < MAX_PLAYERS) { return { status: 400, message: 'Need 3 players to start.' }; }

    // --- 1. RANDOMIZE AND ASSIGN ---
    const availableRoles = [...ROLES];
    shuffleArray(availableRoles);

    // 2. Assign Roles and Initial Run
    game.players.forEach((player, index) => {
        const role = availableRoles[index];
        player.role = role;
        player.run = (role === 'Coward' ? 2 : 1);
    });

    // 3. Randomize Menace
    shuffleArray(MENACES);
    game.menace = MENACES[0];

    // --- 4. INITIALIZE GAME STATE ---
    game.dateStarted = new Date();
    game.turnNumber = 1;
    game.timePeriod = 'Day'; // Turn 1 is always Day
    
    // Shuffle players to determine initial turn order
    shuffleArray(game.players);
    game.activePlayerId = game.players[0].id; 
    
    // Clone the static map to create the dynamic map for tracking
    game.locationMap = JSON.parse(JSON.stringify(STATIC_LOCATION_MAP));
    
    // Copy and shuffle the item pool
    const initialItemPool = [...INITIAL_ITEM_POOL];
    shuffleArray(initialItemPool);
    game.itemPool = initialItemPool;

    game.actionLog.push({ 
        timestamp: new Date(), 
        type: 'SETUP', 
        details: { 
            message: `Game started. Menace assigned, roles distributed.`, 
            initialPlayer: game.activePlayerId 
        } 
    });

    // NOTE: For security, the 'menace' property must NOT be sent to the client 
    // unless 'isMenaceDiscovered' is true.

    return { status: 200, gameState: game };
};