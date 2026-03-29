import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Check, X, Mail } from 'lucide-react';
import type { Invitation } from '../types';

const Invitations: React.FC = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const response = await api.get('/invitations');
      setInvitations(response.data.data || response.data || []);
    } catch (err: any) {
      setError('Failed to load invitations.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: 'accept' | 'reject') => {
    try {
      await api.post(`/invitations/${id}/${action}`);
      if (action === 'accept') {
        setActionMessage({ type: 'success', text: 'Invitation accepted! Redirecting to dashboard...' });
        // Give time for user to read success message before navigating
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        setActionMessage({ type: 'info', text: 'Invitation rejected.' });
        setInvitations((prev) => prev.filter((inv) => inv.id !== id));
        setTimeout(() => setActionMessage({ type: '', text: '' }), 3000);
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || `Failed to ${action} invitation.` });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 mt-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <button onClick={() => navigate('/dashboard')} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors group">
        <ArrowLeft className="h-4 w-4 mr-1.5 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </button>

      <div className="flex items-center mb-6">
        <Mail className="h-6 w-6 text-gray-400 mr-2" />
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pending Invitations</h1>
      </div>

      {actionMessage.text && (
        <div className={`mb-6 p-4 rounded-xl border font-medium text-sm transition-all ${
          actionMessage.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 
          actionMessage.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 
          'bg-gray-50 border-gray-200 text-gray-700'
        }`}>
          {actionMessage.text}
        </div>
      )}

      {error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 font-medium">{error}</div>
      ) : invitations.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm max-w-2xl mx-auto mt-8">
          <div className="mx-auto h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
            <Mail className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No pending invitations</h3>
          <p className="text-gray-500 text-sm">You're all caught up! When someone invites you to their book, it will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invitations.map((inv) => (
            <div key={inv.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col relative overflow-hidden group">
              {/* Top Accent line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 opacity-80"></div>
              
              <div className="mb-4 pt-1">
                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 pr-2">{inv.book?.name || 'Unknown Book'}</h3>
                <div className="flex items-center text-sm text-gray-500 font-medium mb-3">
                  <div className="h-6 w-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs mr-2 shrink-0">
                    {inv.inviter?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  Invited by <span className="font-bold text-gray-800 ml-1 truncate">{inv.inviter?.name || 'Unknown User'}</span>
                </div>
                
                <div className="inline-flex items-center px-2.5 py-1 rounded border border-gray-100 bg-gray-50 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Role: {inv.role}
                </div>
              </div>
              
              <div className="mt-auto pt-5 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => handleAction(inv.id, 'accept')}
                  className="flex-1 inline-flex items-center justify-center py-2 px-3 border border-transparent text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-colors shadow-sm cursor-pointer"
                >
                  <Check className="h-4 w-4 mr-1.5" /> Accept
                </button>
                <button
                  onClick={() => handleAction(inv.id, 'reject')}
                  className="flex-1 inline-flex items-center justify-center py-2 px-3 border border-gray-200 text-sm font-bold rounded-lg text-gray-700 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors shadow-sm cursor-pointer"
                >
                  <X className="h-4 w-4 mr-1.5" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Invitations;
