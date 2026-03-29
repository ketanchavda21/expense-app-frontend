import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type { Book, Transaction } from '../types';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import { ArrowLeft, Send, Users, Activity, TrendingUp, TrendingDown, Trash2, AlertTriangle, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AccessDenied from './AccessDenied';
import NotFoundPage from './NotFoundPage';

interface BookStats {
  total_income: number;
  total_expense: number;
  balance: number;
}

const BookDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [book, setBook] = useState<Book | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<BookStats>({ total_income: 0, total_expense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  
  const [isNotFound, setIsNotFound] = useState(false);
  const [isAccessDenied, setIsAccessDenied] = useState(false);
  const [genericError, setGenericError] = useState('');

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchBookData();
  }, [slug]);

  const fetchBookData = async (retryCount = 0) => {
    if (retryCount === 0) {
      setIsNotFound(false);
      setIsAccessDenied(false);
      setGenericError('');
      setLoading(true);
    }

    try {
      const [bookRes, txRes] = await Promise.all([
        api.get(`/books/${slug}`),
        api.get(`/books/${slug}/transactions`)
      ]);
      
      const bookData = bookRes.data.data || bookRes.data;
      const transactionsData = txRes.data.data || txRes.data;
      
      const assumedOwner = bookData.user_id === user?.id;
      if (!assumedOwner && !bookData.role && retryCount < 3) {
        console.warn(`Role missing, retrying fetch (${retryCount + 1}/3)...`);
        setTimeout(() => fetchBookData(retryCount + 1), 1000);
        return; // keeps loading state true
      }
      
      setBook(bookData);
      setTransactions(transactionsData || []);
      setStats({
        total_income: bookData.total_income || 0,
        total_expense: bookData.total_expense || 0,
        balance: bookData.balance || 0,
      });
    } catch (err: any) {
      if (err.response?.status === 404 || err.response?.data?.message?.toLowerCase().includes('not found')) {
        setIsNotFound(true);
      } else if (err.response?.status === 403 || err.response?.data?.message?.toLowerCase().includes('access')) {
        setIsAccessDenied(true);
      } else {
        setGenericError('Failed to fetch book data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setInviteLoading(true);
    setInviteMsg('');

    try {
      console.log("Inviting to book:", slug);
      const response = await api.post(`/books/${slug}/invite`, { email: inviteEmail });
      
      const resMsg = response.data?.message?.toLowerCase() || "";
      if (resMsg.includes("already") && resMsg.includes("pending")) {
        setInviteMsg("Invitation already pending");
      } else if (resMsg.includes("again") || resMsg.includes("resent")) {
        setInviteMsg("Invitation sent again");
      } else {
        setInviteMsg('User invited successfully!');
      }

      setInviteEmail('');
      fetchBookData();
      window.dispatchEvent(new Event('refreshNotifications'));
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "";
      if (errorMsg.toLowerCase().includes("already") && errorMsg.toLowerCase().includes("pending")) {
        setInviteMsg("Invitation already pending");
      } else if (errorMsg.toLowerCase().includes("re-invited") || errorMsg.toLowerCase().includes("resent")) {
        setInviteMsg("Invitation sent again");
      } else {
        alert(errorMsg || 'Failed to invite user');
      }
    } finally {
      setInviteLoading(false);
    }
  };

  const handleUpdateRole = async (memberId: number, newRole: string) => {
    try {
      await api.put(`/books/${slug}/members/${memberId}`, { role: newRole });
      fetchBookData(); 
    } catch (err) {
      const error = err as any;
      alert(error.response?.data?.message || 'Failed to change role');
    }
  };

  const handleDeleteTransaction = async (txId: number) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await api.delete(`/transactions/${txId}`);
      fetchBookData();
    } catch (err) {
      try {
        await api.delete(`/books/${slug}/transactions/${txId}`);
        fetchBookData();
      } catch {
        alert('Failed to delete transaction.');
      }
    }
  };

  const handleDeleteBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmName !== book?.name) return;

    setDeleteLoading(true);
    try {
      await api.delete(`/books/${slug}`);
      // Since no toast library is present, we rely on navigation feedback
      // or optionally alert on success if the user preferred.
      navigate('/dashboard');
    } catch (err) {
      const error = err as any;
      alert(error.response?.data?.message || 'Failed to delete book.');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (isAccessDenied) return <AccessDenied />;
  if (isNotFound) return <NotFoundPage />;

  if (genericError || !book) {
    return (
      <div className="py-8 max-w-2xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-6 group">
          <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-rose-700 font-medium shadow-sm">
          {genericError || 'Unable to load book details. Please try again later.'}
        </div>
      </div>
    );
  }
  
  let effectiveRole = book.role;
  if (!effectiveRole) {
    const memberObj = book.members?.find(m => m.user?.id === user?.id);
    effectiveRole = memberObj?.role;
  }

  // Ultimate fail-safe for owner
  if (!effectiveRole && book.user_id === user?.id) {
    effectiveRole = 'owner';
  }
  // Safety: If role is totally undefined, do NOT block owner blindly, show retry/fallback spinner
  if (effectiveRole === undefined) {
    return (
      <div className="mx-auto mt-8 flex max-w-xl flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-teal-600"></div>
        <h2 className="mb-2 text-xl font-bold text-slate-900">Verifying Role...</h2>
        <p className="mb-4 text-sm text-slate-500">
          Attempting to load your access permissions safely.
        </p>
        <button 
          onClick={() => fetchBookData()} 
          className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition-colors hover:bg-white"
        >
          Force Retry
        </button>
      </div>
    );
  }
  
  const isOwner = effectiveRole === 'owner';
  const isEditor = effectiveRole !== 'viewer';

  return (
    <div className="py-2">
      <button onClick={() => navigate('/dashboard')} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors group">
        <ArrowLeft className="h-4 w-4 mr-1.5 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </button>

      {/* Header section */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
          <div className="mb-2 sm:mb-0">
            <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900">{book.name}</h1>
            {book.description && <p className="max-w-2xl text-sm text-slate-500">{book.description}</p>}
          </div>
          
          <div>
            {isOwner ? (
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600 shadow-sm transition-all hover:bg-rose-100 focus:ring-2 focus:ring-rose-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Book
              </button>
            ) : (
              <button 
                disabled
                title="Only owners can delete this book"
                className="inline-flex items-center rounded-lg border border-slate-100 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-400 cursor-not-allowed transition-all opacity-60"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Book
              </button>
            )}
          </div>
        </div>
        
        {/* Stats row */}
        <div className="grid grid-cols-1 gap-6 border-t border-slate-100 pt-6 md:grid-cols-3">
          <div className="flex flex-col rounded-xl border border-slate-100 bg-slate-50 p-5 shadow-sm">
            <div className="flex items-center mb-3">
              <div className="mr-3 rounded-md border border-slate-100 bg-white p-2 shadow-sm">
                <Activity className="h-5 w-5 text-slate-700" />
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Balance</h3>
            </div>
            <p className={`mt-auto text-3xl font-bold ${stats.balance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
              ₹{Number(Math.abs(stats.balance)).toFixed(2)}
            </p>
          </div>

          <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-colors">
            <div className="flex items-center mb-3">
              <div className="mr-3 rounded-md bg-emerald-50 p-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Income</h3>
            </div>
            <p className="mt-auto text-2xl font-semibold text-slate-900">₹{Number(stats.total_income).toFixed(2)}</p>
          </div>

          <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-colors">
            <div className="flex items-center mb-3">
              <div className="mr-3 rounded-md bg-rose-50 p-2">
                <TrendingDown className="h-5 w-5 text-rose-600" />
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Expense</h3>
            </div>
            <p className="mt-auto text-2xl font-semibold text-slate-900">₹{Number(stats.total_expense).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Transactions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pl-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Recent Transactions</h2>
          </div>
          
          <TransactionList 
            transactions={transactions} 
            onDelete={isEditor ? handleDeleteTransaction : undefined}
            currentUserId={user?.id}
          />
        </div>

        {/* Right Column: Add tx & Members */}
        <div className="space-y-6">
          {isEditor ? (
             <TransactionForm bookSlug={book.slug} onSuccess={fetchBookData} />
          ) : (
            <div className="w-full flex items-center justify-center py-3 px-4 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 text-sm font-semibold cursor-not-allowed opacity-60" title="You only have read-only access to this book">
               <PlusCircle className="h-5 w-5 mr-2" />
               Add Transaction
            </div>
          )}
          
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center border-b border-slate-100 pb-4">
              <div className="mr-3 rounded-md border border-slate-200 bg-slate-50 p-2 text-slate-600">
                <Users className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Members</h3>
            </div>
            
            <ul className="mb-6 space-y-3">
              {book.members?.filter(m => m.status !== 'pending' && m.status !== 'rejected').map((member) => {
                const memberName = member.name || member.user?.name || 'Unknown User';
                const memberEmail = member.email || member.user?.email || 'No email provided';
                const memberInitials = memberName.charAt(0).toUpperCase() || '?';
                const isCurrentUser = user?.id === (member.user?.id || member.id);
                
                return (
                <li key={member.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm transition-colors hover:bg-white hover:shadow-sm">
                  <div className="flex items-center overflow-hidden">
                    <div className="mr-3 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-teal-200 bg-teal-100 font-bold text-teal-700 shadow-sm">
                      {memberInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {memberName}
                        <span className={`ml-1.5 rounded-md px-1.5 py-0.5 text-xs font-normal capitalize ${
                          member.role === 'owner' ? 'bg-amber-100 text-amber-700' : 
                          member.role === 'editor' ? 'bg-teal-100 text-teal-700' : 
                          'bg-slate-100 text-slate-700'
                        }`}>
                          ({member.role})
                        </span>
                      </p>
                      <p className="mt-1 truncate text-xs font-medium text-slate-500">{memberEmail}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end flex-shrink-0 ml-4">
                    {isCurrentUser && (
                      <span className="mb-1 rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 shadow-sm">You</span>
                    )}
                    
                    {isOwner && !isCurrentUser && (
                      member.role === 'owner' ? (
                        <div className="mt-1 flex items-center rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-400 shadow-sm opacity-70 cursor-not-allowed" title="Owner role cannot be changed">
                          Owner
                        </div>
                      ) : (
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                          className="mt-1 block rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition-colors hover:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
                        >
                          <option value="owner">Owner</option>
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      )
                    )}
                  </div>
                </li>
              )})}
              {(!book.members || book.members.filter(m => m.status !== 'pending' && m.status !== 'rejected').length === 0) && (
                <li className="rounded-lg bg-slate-50 p-2 text-center text-sm text-slate-500">No additional members</li>
              )}
            </ul>

            {isOwner && (
              <div className="border-t border-slate-100 pt-6">
                <h4 className="mb-3 text-sm font-bold text-slate-800">Invite User</h4>
                <form onSubmit={handleInvite} className="flex flex-col space-y-3">
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="w-full flex items-center justify-center rounded-lg bg-slate-900 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800 disabled:bg-slate-400 focus:ring-2 focus:ring-teal-400 focus:ring-offset-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {inviteLoading ? 'Sending...' : 'Send Invite'}
                  </button>
                  {inviteMsg && <p className="mt-2 text-center text-xs font-bold text-emerald-600 animate-pulse">{inviteMsg}</p>}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Book Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md transition-opacity">
          <div className="w-full max-w-md scale-100 transform overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl transition-all">
            <form onSubmit={handleDeleteBook}>
              <div className="px-6 py-8 sm:px-10">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-rose-100 bg-rose-50 shadow-inner">
                  <AlertTriangle className="h-8 w-8 text-rose-600" />
                </div>
                <h3 className="mb-2 text-center text-2xl font-bold text-slate-900">
                  Delete Book?
                </h3>
                <p className="mx-auto mb-8 max-w-sm text-center text-sm leading-relaxed text-slate-500">
                  This action is permanent and cannot be undone. You are about to delete <strong>{book?.name}</strong> and all its history.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 ml-1 block text-xs font-bold uppercase tracking-widest text-slate-500">
                      Type name to confirm
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={book?.name || ''}
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-medium text-slate-900 shadow-sm transition-all hover:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                      value={deleteConfirmName}
                      onChange={(e) => setDeleteConfirmName(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/80 px-8 py-5 sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={deleteLoading || deleteConfirmName !== book?.name}
                  className="inline-flex flex-1 justify-center rounded-xl bg-rose-600 px-6 py-3 text-base font-bold text-white shadow-lg shadow-rose-100 transition-all hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-rose-300"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Forever'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmName('');
                  }}
                  className="inline-flex flex-1 justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-base font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                >
                  Keep Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetail;
