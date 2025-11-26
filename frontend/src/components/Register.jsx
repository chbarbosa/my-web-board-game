import React, { useState } from 'react';
import { registerUser } from '../api/apiClient';

const Register = ({ onRegistrationSuccess, onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        name: '', email: '', country: '', password: '',
    });
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);
        setIsLoading(true);

        try {
            const response = await registerUser(formData);
            
            setMessage(`Success! ${response.message} Check your email to confirm registration.`);
            setIsError(false);
            setFormData({ name: '', email: '', country: '', password: '' });
            
            if (onRegistrationSuccess) {
                onRegistrationSuccess(formData.email); 
            }

        } catch (error) {
            console.error('Registration Failed:', error);
            setMessage(error.message || 'Registration failed due to an internal server error.');
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Dark theme classes using your custom colors
    const inputClasses = "w-full p-3 border border-gunmetal bg-dark-void text-lead-light placeholder-gunmetal focus:border-blood-red focus:outline-none transition duration-150";
    const buttonClasses = "w-full py-3 mt-4 text-lg font-semibold bg-blood-red hover:bg-red-800 transition duration-150 rounded-md";

    return (
        <div className="max-w-md mx-auto p-6 bg-dark-void border border-gunmetal shadow-lg">
            <h2 className="text-3xl font-bold text-center text-lead-light mb-6 border-b border-gunmetal pb-3">
                Join the Fold
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required className={inputClasses} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required className={inputClasses} />
                <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="Country (e.g., CA)" required className={inputClasses} />
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required className={inputClasses} />
                
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`${buttonClasses} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isLoading ? 'Creating Pact...' : 'Register'}
                </button>
            </form>

            <div className="text-center mt-4 text-sm text-lead-light">
                Already registered? 
                <button 
                    type="button" 
                    onClick={onSwitchToLogin} 
                    className="text-blood-red hover:text-red-400 ml-1 font-medium transition duration-150"
                >
                    Login here.
                </button>
            </div>

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

export default Register;