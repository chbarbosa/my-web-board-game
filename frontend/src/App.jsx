import React, { useState } from 'react';
import Register from './components/Register';
import Login from './components/Login';

// Define view constants
const VIEWS = {
  REGISTER: 'register',
  LOGIN: 'login',
  GAME: 'game'
};

function App() {
  // Check if a user ID is already stored to decide the initial view
  const initialView = localStorage.getItem('user_id') ? VIEWS.GAME : VIEWS.REGISTER;
  const [currentView, setCurrentView] = useState(initialView);
  
  // Handlers for changing the view
  const handleRegistrationSuccess = () => setCurrentView(VIEWS.LOGIN);
  const handleLoginSuccess = (userId) => {
    console.log(`User ${userId} is authenticated. Starting game.`);
    setCurrentView(VIEWS.GAME);
  };
  const handleSwitchToRegister = () => setCurrentView(VIEWS.REGISTER);
  const handleSwitchToLogin = () => setCurrentView(VIEWS.LOGIN);

  // Function to render the correct component based on state
  const renderView = () => {
    switch (currentView) {
      case VIEWS.LOGIN:
        return (
          <Login 
            onLoginSuccess={handleLoginSuccess} 
            onSwitchToRegister={handleSwitchToRegister} 
          />
        );
      case VIEWS.REGISTER:
        return (
          <Register 
            onRegistrationSuccess={handleRegistrationSuccess} 
            onSwitchToLogin={handleSwitchToLogin} // We should add this prop to Register.jsx
          />
        );
      case VIEWS.GAME:
        return (
          <div className="text-4xl text-lead-light">
            Welcome! Game interface goes here.
          </div>
        );
      default:
        return <Register onRegistrationSuccess={handleRegistrationSuccess} />;
    }
  };  
  return (
    <div className="flex h-screen w-full items-center justify-center bg-dark-void" >
      <div className="bg-grey p-6 rounded shadow">
        {renderView()}
      </div>
    </div>
  );
}

export default App;