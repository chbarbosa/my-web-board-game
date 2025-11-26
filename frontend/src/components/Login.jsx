import React, { useState } from 'react';
import { loginUser } from '../api/apiClient';

const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);
        setIsLoading(true);

        try {
            const response = await loginUser(formData);
            
            // --- CRITICAL STEP: Store User Identifier ---
            const userId = response.id; 
            
            // In a real application, this is where you would store the ID/Token
            // using local storage, session storage, or a dedicated state manager.
            localStorage.setItem('user_id', userId);
            console.log("Login Successful! Stored User ID:", userId);

            setMessage(`Welcome back, User ID: ${userId.substring(0, 4)}...`);
            setIsError(false);
            
            // Call success handler to switch the main app view
            if (onLoginSuccess) {
                onLoginSuccess(userId); 
            }

        } catch (error) {
            // Error handling from apiClient
            console.error('Login Failed:', error);
            setMessage(error.message || 'Login failed. Check your email and password.');
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Define Tailwind classes for the dark theme
    const inputClasses = "w-full p-3 border border-gunmetal bg-dark-void text-lead-light placeholder-gunmetal focus:border-blood-red focus:outline-none transition duration-150";
    const buttonClasses = "w-full py-3 mt-4 text-lg font-semibold bg-blood-red hover:bg-red-800 transition duration-150 rounded-md";

    return (
        <div className="max-w-md mx-auto p-6 bg-dark-void border border-gunmetal shadow-lg">
            <h2 className="text-3xl font-bold text-center text-lead-light mb-6 border-b border-gunmetal pb-3">
                Enter the Fray
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                    className={inputClasses}
                />
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    className={inputClasses}
                />
                
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`${buttonClasses} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isLoading ? 'Decrypting Access...' : 'Login'}
                </button>
            </form>

            {/* Link to Register */}
            <div className="text-center mt-4 text-sm text-lead-light">
                New player? 
                <button 
                    type="button" 
                    onClick={onSwitchToRegister} 
                    className="text-blood-red hover:text-red-400 ml-1 font-medium transition duration-150"
                >
                    Register here.
                </button>
            </div>

            {/* Message/Feedback Area */}
            {message && (
                <div 
                    className={`mt-4 p-3 rounded-md text-center font-medium ${
                        isError ? 'bg-blood-red/20 text-blood-red border border-blood-red' : 'bg-gunmetal/30 text-lead-light border border-gunmetal'
                    }`}
                >
                    {message}
                </div>
            )}
        </div>
    );
};

export default Login;