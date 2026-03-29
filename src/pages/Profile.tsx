import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { User, Mail, Phone, Lock, CheckCircle, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user, login } = useAuth(); // getting logic to update global user state
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isPhoneFixed, setIsPhoneFixed] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      const data = response.data;
      setName(data.name || '');
      setEmail(data.email || '');
      
      if (data.phone) {
        setPhone(data.phone);
        setIsPhoneFixed(true);
      } else {
        setPhone('');
        setIsPhoneFixed(false);
      }
    } catch (err) {
      console.error(err);
      // Fallback to context user if API fails
      if (user) {
        setName(user.name);
        setEmail(user.email);
        setPhone('');
        setIsPhoneFixed(false);
      }
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== passwordConfirmation) {
      return setError('Passwords do not match');
    }
    
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload: any = { name };
      if (!isPhoneFixed && phone) {
        payload.phone = phone;
      }
      if (password) {
        payload.password = password;
        payload.password_confirmation = passwordConfirmation;
      }
      
      const response = await api.put('/profile', payload);
      
      // Update global context with new user data but keeping existing token
      // Assuming response.data.user has the updated user
      const updatedUser = response.data.user || { ...user, name };
      const currentToken = localStorage.getItem('token') || '';
      if (currentToken) {
        login(currentToken, updatedUser);
      }
      
      setSuccess('Profile updated successfully!');
      setPassword('');
      setPasswordConfirmation('');
      
      // If we just updated the phone, lock it.
      if (!isPhoneFixed && phone) {
        setIsPhoneFixed(true);
      }
      
      // Auto hide success after 3s
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const error = err as any;
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0] as string[];
        setError(firstError[0]);
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Profile Settings</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">Manage your account details and security.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Toast Notifications */}
        {error && (
          <div className="mx-6 mt-6 flex items-center rounded-lg border border-rose-100 bg-rose-50 p-4">
            <AlertCircle className="h-5 w-5 text-rose-500 mr-2 flex-shrink-0" />
            <p className="text-sm font-semibold text-rose-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-6 flex items-center rounded-lg border border-emerald-100 bg-emerald-50 p-4">
            <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0" />
            <p className="text-sm font-semibold text-emerald-800">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-slate-900 transition-colors hover:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-300 sm:text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email (Read only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  disabled
                  value={email}
                  className="block w-full rounded-lg border border-slate-200 bg-slate-100 py-2.5 pl-10 pr-3 text-slate-500 cursor-not-allowed sm:text-sm"
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">Email cannot be changed.</p>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  id="phone"
                  disabled={isPhoneFixed}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className={`block w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 sm:text-sm ${
                    isPhoneFixed 
                    ? 'bg-slate-100 text-slate-500 cursor-not-allowed' 
                    : 'bg-slate-50 hover:bg-white focus:ring-2 focus:ring-teal-300 focus:border-teal-400 transition-colors text-slate-900'
                  }`}
                />
              </div>
              {isPhoneFixed ? (
                <p className="mt-1 text-xs text-slate-400">Phone number cannot be changed.</p>
              ) : (
                <p className="mt-1 text-xs text-teal-600">You can add your phone number now. Once saved, it cannot be changed.</p>
              )}
            </div>

            <div className="pt-4 pb-2">
              <div className="h-px bg-slate-100 w-full"></div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">New Password <span className="text-slate-400 font-normal">(optional)</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-slate-900 transition-colors hover:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-300 sm:text-sm"
                  placeholder="Leave blank to keep same"
                />
              </div>
            </div>

            {/* Confirm Password */}
            {password && (
              <div>
                <label htmlFor="password_confirmation" className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    id="password_confirmation"
                    required
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-slate-900 transition-colors hover:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-300 sm:text-sm"
                    placeholder="Confirm your new password"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center rounded-lg border border-transparent bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 disabled:bg-slate-400"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
