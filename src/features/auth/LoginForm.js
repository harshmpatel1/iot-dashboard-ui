import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
// Assuming these are your custom components
import Input from '../../components/common/Input'; 
import Button from '../../components/common/Button'; 
import ChangePassword from './ChangePassword'; // Import the ChangePassword component
// Use standard icons for password toggle
import { Eye, EyeOff } from 'lucide-react'; 

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [Selected, setSelected] = useState('')
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const { login } = useAuth(); 
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError('');

    if (!Selected) {
      setError('An unspecified error occurred. Please select a login role.');
      return;
    }

    try {
      await login(email, password, Selected);
      navigate('/');
    } catch (err) {
      // Use a more generic, user-friendly error message
      setError('Invalid login credentials or role. Please try again.');
    }
  };

  return (
    // Added gap-y-4 for tighter, more modern spacing between fields
    <form className="space-y-4"> 
      
      {error && (
        <p className="bg-red-100 text-red-700 p-3 rounded-lg text-center font-medium border border-red-300">
          {error}
        </p>
      )}

      {/* Email Input */}
      <Input
        id="email"
        name="email"
        type="email"
        placeholder="Enter your email address" // More descriptive placeholder
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        // SUGGESTION: Your Input component should have these classes:
        // className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
        required
      />
      
      {/* Password Input with Toggle */}
      <div className="relative"> 
        <Input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'} 
          placeholder="Enter your password" // More descriptive placeholder
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          // IMPORTANT: Add right padding (e.g., pr-10) to the Input component 
          // to make space for the toggle icon.
          // className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-10"
          required
        />
        <button
          type="button" 
          onClick={togglePasswordVisibility}
          // Styled the button to sit neatly inside the field
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-400 hover:text-indigo-600 transition duration-150" 
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            // Use EyeOff for a cleaner toggle UX
            <EyeOff className='h-5 w-5' /> 
          ) : (
            // Use Eye for a cleaner toggle UX
            <Eye className='h-5 w-5' /> 
          )}
        </button>
      </div>
        {/* <div onClick={
          () => {
            if(email !="" && Selected !="") {
              console.log("Navigating to change-password with email:", email, "and role:", Selected);
              navigate(`/change-password/${Selected}?email=${encodeURIComponent(email)}`);
            }else{
              alert("Please enter your email and select a role before proceeding to reset your password.");
            }
          }
          } className=" flex justify-end items-center w-full text-sm text-red-600 hover:text-red-500 cursor-pointer">
       Change Password?
      </div> */}
      <div onClick={
          () => {
            
              navigate(`/forgot-password`);
            
          }
          } className=" flex justify-end items-center w-full text-sm text-red-600 hover:text-red-500 cursor-pointer">
       Forgot Password?
      </div>
      <div>
    
      <select
        value={Selected}
        onChange={(e) => setSelected(e.target.value)}
                className="text-sm w-full px-3 py-2 placeholder-gray-500 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-indigo-50"

      >
        <option value="">-- Choose Your Role --</option>
        <option value="admin">Admin</option>
        <option value="engineer">Engineer</option>
        <option value="merchant">Merchant</option>
        
      </select>
      </div>
      
      {/* Action Buttons Group */}
      {/* Added flex-col-reverse on small screens for better mobile experience */}
     
      <Button 
          type="submit" // Changed to submit type, which is more standard
          onClick={(e) => handleSubmit(e)} 
          // SUGGESTION: Your Button component should use primary styles:
          // className="w-full sm:w-1/2 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
        >
          Submit 👨‍💻
        </Button>
      
    </form>
  );
};

export default LoginForm;