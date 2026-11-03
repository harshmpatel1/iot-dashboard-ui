import { useState } from 'react';
import LoginForm from '../features/auth/LoginForm';

const AuthPage = () => {
  return (
    <div className=" min-h-screen flex flex-col justify-center items-center p-4 
                    bg-gradient-to-br from-yellow-500 to-orange-600 bg-cover bg-center bg-no-repeat"
         style={{ backgroundImage: 'url(/bg-main.jpg)' }}>
      
      {/* Optional overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      
      {/* Login Card Container */}
      <div className="backdrop-blur-md max-w-lg w-full mx-auto border-orange-600 border-2 p-10 rounded-3xl 
                      shadow-2xl transform transition duration-500 hover:scale-[1.01] 
                      relative z-10">
        
        {/* Rest of your content remains the same */}
        <div className="h-1.5 w-16 bg-orange-500 rounded-full mx-auto mb-6"></div>
        
        <h2 className="text-4xl font-extrabold text-center mb-8 
                       text-gray-800 tracking-tight">
          Welcome <span className="text-orange-600">Back</span>!
        </h2>
        
        <p className="text-center text-white mb-8">
            Sign in to access your dashboard.
        </p>

        <LoginForm/>
        
      </div>
    </div>
  );
};

export default AuthPage;