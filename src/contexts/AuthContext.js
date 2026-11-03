import { createContext, useState, useEffect } from 'react';
import { apiLogin, apiLogout, apiCheckAuth } from '../api/mockApis';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    // New state to prevent rendering the app before the cookie check is complete
    const [loading, setLoading] = useState(true); 

    // CHECK FOR COOKIE/TOKEN ON INITIAL LOAD (The "7-day check")
    useEffect(() => {
        const checkExistingSession = async () => {
            try {
                // This calls the server endpoint /api/auth/me which checks the cookie
                const loggedInUser = await apiCheckAuth(); 
                console.log('Initial auth check response:', loggedInUser);
                if (loggedInUser) {
                    // If the server validates the cookie, set the user state
                    // loggedInUser['role'] = 'merchant';
                    setUser(loggedInUser);
                    console.log('uss',user);
                }

            } catch (error) {
                console.error('Initial auth check failed:', error);
                // Cookie was invalid or server error; user remains null
            } finally {
                // Must set loading to false to render the main application content
                setLoading(false);
            }
        };

        checkExistingSession();
    }, []); // Run only once on mount

    const login = async (email, password, role) => {
        // The server handles hashing and setting the HTTP-only cookie
        const loggedInUser = await apiLogin(email, password, role);
        
        if (loggedInUser) {
            // Set the user state based on the server's successful response
            setUser(loggedInUser);
        } else {
            throw new Error("Login failed: Invalid credentials or API error.");
        }
    };

    const logout = async () => {
        // 1. Call the server to crash the HTTP-only cookie
        await apiLogout(); 
        
        // 2. Clear the state in React's memory
        setUser(null);
    };

    const value = { user, login, logout, isAuthenticated: !!user, loading };
    
    // Render loading state or children once the cookie check is done
    if (loading) {
        // You can replace this with a beautiful loading spinner component
        return (
            <div style={{ padding: '20px', textAlign: 'center', fontSize: '18px' }}>
                Loading...
            </div>
        ); 
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
