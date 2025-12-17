# My Web Board Game: no name yet

Project Status: Under Active Construction (Backend Core & API Defined)

This project is the digital implementation of a physical board game designed five years ago by the author. The current implementation is being developed with the primary assistance of two generative AI models: Gemini (Google) and Qwen (Alibaba Cloud), focusing on robust backend architecture and data modeling.

## Game Concept & Design Origin
The game is a turn-based, asymmetric survival/mystery board game for 3 players.

Designer: [Your Name/Initial]

Original Design Date: [Approximate Year, e.g., 2020]

Theme: Victorian Manor investigation against a secret supernatural Menace.

Core Loop: Investigators (Players 1-3) must gather resources (Items), survive encounters (Run), and use their unique Roles to identify and defeat the Menace before being eliminated.

Key Asymmetries:
Information: The Menace is randomly selected at the start and remains secret until revealed by specific actions or defense traps.

Roles: Each Investigator possesses a unique passive ability (e.g., Policeman, Coward, Ghosthunter).

Time: The game progresses through Day, Dawn, and Night cycles, affecting actions and Menace power.

## Solution Architecture Overview
The solution follows a standard Monorepo structure with a clear separation of concerns using a Vite/React Frontend and a Node/Express Backend.

## Getting Started
### Prerequisites
- Node.js (v20+ recommended)
- npm

### Installation and Running
1. Clone the Repository:

```
git clone this repo
cd my-web-board-game
```
2. Install Dependencies:

```
npm install # (Install root dependencies if you have them)
npm install --prefix backend
npm install --prefix frontend
```
3. Start the API Server and Client (Monorepo Setup):

```
# Run the main script defined in your root package.json
npm start
```

> (Typically runs: npm run start:api and npm run start:client concurrently)