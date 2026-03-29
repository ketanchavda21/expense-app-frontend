import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (token) {
        try {
          // Store token as requested
          localStorage.setItem('token', token);
          
          // Optionally fetch user to populate context fully
          const response = await api.get('/user');
          
          login(token, response.data);
          navigate('/dashboard');
        } catch (err) {
          console.error(err);
          setError('Google login failed');
        }
      } else {
        setError('Google login failed');
      }
    };

    handleCallback();
  }, [navigate, login]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 min-w-[300px]">
        {error ? (
          <>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{error}</h2>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Back to Login
            </button>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 border-t-transparent mb-4"></div>
            <h2 className="text-lg font-semibold text-gray-700">Completing Sign In...</h2>
            <p className="mt-2 text-sm text-gray-500">Please wait while we log you in.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
