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
          localStorage.setItem('token', token);
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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="min-w-[300px] rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        {error ? (
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
              <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{error}</h2>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-teal-600 border-t-transparent"></div>
            <h2 className="text-lg font-semibold text-slate-700">Completing Sign In...</h2>
            <p className="mt-2 text-sm text-slate-500">Please wait while we log you in.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
