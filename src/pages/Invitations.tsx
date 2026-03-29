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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <button onClick={() => navigate('/dashboard')} className="mb-6 inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 group">
        <ArrowLeft className="h-4 w-4 mr-1.5 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </button>

      <div className="flex items-center mb-6">
        <Mail className="h-6 w-6 text-teal-600 mr-2" />
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pending Invitations</h1>
      </div>

      {actionMessage.text && (
        <div className={`mb-6 p-4 rounded-xl border font-medium text-sm transition-all ${
          actionMessage.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
          actionMessage.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-700' : 
          'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          {actionMessage.text}
        </div>
      )}

      {error ? (
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 font-medium text-rose-700">{error}</div>
      ) : invitations.length === 0 ? (
        <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-slate-100 bg-slate-50">
            <Mail className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="mb-1 text-lg font-bold text-slate-900">No pending invitations</h3>
          <p className="text-sm text-slate-500">You're all caught up! When someone invites you to their book, it will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invitations.map((inv) => (
            <div key={inv.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
              {/* Top Accent line */}
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 opacity-90"></div>
              
              <div className="mb-4 pt-1">
                <h3 className="mb-2 pr-2 text-lg font-bold leading-tight text-slate-900">{inv.book?.name || 'Unknown Book'}</h3>
                <div className="mb-3 flex items-center text-sm font-medium text-slate-500">
                  <div className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-teal-100 bg-teal-50 text-xs font-bold text-teal-700">
                    {inv.inviter?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  Invited by <span className="ml-1 truncate font-bold text-slate-800">{inv.inviter?.name || 'Unknown User'}</span>
                </div>
                
                <div className="inline-flex items-center rounded border border-slate-100 bg-slate-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-600">
                  Role: {inv.role}
                </div>
              </div>
              
              <div className="mt-auto flex gap-3 border-t border-slate-100 pt-5">
                <button
                  onClick={() => handleAction(inv.id, 'accept')}
                  className="flex-1 inline-flex cursor-pointer items-center justify-center rounded-lg border border-transparent bg-emerald-600 px-3 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1"
                >
                  <Check className="h-4 w-4 mr-1.5" /> Accept
                </button>
                <button
                  onClick={() => handleAction(inv.id, 'reject')}
                  className="flex-1 inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
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
