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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAccessDenied) return <AccessDenied />;
  if (isNotFound) return <NotFoundPage />;

  if (genericError || !book) {
    return (
      <div className="py-8 max-w-2xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-6 group">
          <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>
        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-red-700 font-medium shadow-sm">
          {genericError || 'Unable to load book details. Please try again later.'}
        </div>
      </div>
    );
  }
  
  console.log("Book Data:", book);
  console.log("Book Role:", book.role);
  
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
      <div className="flex flex-col items-center justify-center p-12 mt-8 bg-white rounded-xl border border-gray-200 max-w-xl mx-auto text-center shadow-sm">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying Role...</h2>
        <p className="text-gray-500 text-sm mb-4">
          Attempting to load your access permissions safely.
        </p>
        <button 
          onClick={() => fetchBookData()} 
          className="inline-flex items-center px-4 py-2 border border-gray-200 shadow-sm text-sm font-bold rounded-lg text-gray-600 bg-gray-50 hover:bg-white transition-colors"
        >
          Force Retry
        </button>
      </div>
    );
  }
  
  const isOwner = effectiveRole === 'owner';
  const isEditor = effectiveRole !== 'viewer';

  console.log("Role:", effectiveRole);
  console.log("User:", user?.id);
  console.log("Members:", book.members);

  return (
    <div className="py-2">
      <button onClick={() => navigate('/dashboard')} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors group">
        <ArrowLeft className="h-4 w-4 mr-1.5 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </button>

      {/* Header section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
          <div className="mb-2 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">{book.name}</h1>
            {book.description && <p className="text-gray-500 text-sm max-w-2xl">{book.description}</p>}
          </div>
          
          <div>
            {isOwner ? (
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center px-4 py-2 border border-red-200 text-sm font-bold rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-all shadow-sm focus:ring-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Book
              </button>
            ) : (
              <button 
                disabled
                title="Only owners can delete this book"
                className="inline-flex items-center px-4 py-2 border border-gray-100 text-sm font-bold rounded-lg text-gray-400 bg-gray-50 cursor-not-allowed transition-all opacity-60"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Book
              </button>
            )}
          </div>
        </div>
        
        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
          <div className="rounded-xl p-5 border border-gray-100 shadow-sm bg-gray-50 flex flex-col">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-white shadow-sm border border-gray-100 rounded-md mr-3">
                <Activity className="h-5 w-5 text-gray-700" />
              </div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Balance</h3>
            </div>
            <p className={`text-3xl font-bold mt-auto ${stats.balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
              ₹{Number(Math.abs(stats.balance)).toFixed(2)}
            </p>
          </div>

          <div className="rounded-xl p-5 border border-gray-100 shadow-sm bg-white flex flex-col transition-colors">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-green-50 rounded-md mr-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Income</h3>
            </div>
            <p className="text-2xl font-semibold text-gray-900 mt-auto">₹{Number(stats.total_income).toFixed(2)}</p>
          </div>

          <div className="rounded-xl p-5 border border-gray-100 shadow-sm bg-white flex flex-col transition-colors">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-red-50 rounded-md mr-3">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Expense</h3>
            </div>
            <p className="text-2xl font-semibold text-gray-900 mt-auto">₹{Number(stats.total_expense).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Transactions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pl-1">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recent Transactions</h2>
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
            <div className="w-full flex items-center justify-center py-3 px-4 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 text-sm font-semibold cursor-not-allowed opacity-60" title="You only have read-only access to this book">
               <PlusCircle className="h-5 w-5 mr-2" />
               Add Transaction
            </div>
          )}
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center mb-6 border-b border-gray-100 pb-4">
              <div className="p-2 bg-gray-50 rounded-md mr-3 text-gray-600 border border-gray-200">
                <Users className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Members</h3>
            </div>
            
            <ul className="mb-6 space-y-3">
              {book.members?.filter(m => m.status !== 'pending' && m.status !== 'rejected').map((member) => {
                const memberName = member.name || member.user?.name || 'Unknown User';
                const memberEmail = member.email || member.user?.email || 'No email provided';
                const memberInitials = memberName.charAt(0).toUpperCase() || '?';
                const isCurrentUser = user?.id === (member.user?.id || member.id);
                
                return (
                <li key={member.id} className="flex justify-between items-center text-sm p-3 rounded-lg bg-gray-50 border border-gray-100 transition-colors hover:bg-white hover:shadow-sm">
                  <div className="flex items-center overflow-hidden">
                    <div className="h-9 w-9 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold mr-3 shadow-sm border border-blue-200">
                      {memberInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {memberName}
                        <span className={`font-normal ml-1.5 capitalize text-xs px-1.5 py-0.5 rounded-md ${
                          member.role === 'owner' ? 'bg-purple-100 text-purple-700' : 
                          member.role === 'editor' ? 'bg-blue-100 text-blue-700' : 
                          'bg-gray-100 text-gray-700'
                        }`}>
                          ({member.role})
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 font-medium mt-1 truncate">{memberEmail}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end flex-shrink-0 ml-4">
                    {isCurrentUser && (
                      <span className="px-2 py-0.5 mb-1 rounded text-[10px] font-bold bg-white text-gray-600 border border-gray-200 shadow-sm uppercase tracking-wide">You</span>
                    )}
                    
                    {isOwner && !isCurrentUser && (
                      member.role === 'owner' ? (
                        <div className="mt-1 py-1.5 px-3 border border-gray-100 bg-gray-50 rounded-lg text-xs font-bold text-gray-400 cursor-not-allowed shadow-sm opacity-70 flex items-center" title="Owner role cannot be changed">
                          Owner
                        </div>
                      ) : (
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                          className="mt-1 block py-1.5 px-3 border border-gray-200 bg-white rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm hover:border-blue-300 transition-colors"
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
                <li className="text-sm text-gray-500 p-2 text-center bg-gray-50 rounded-lg">No additional members</li>
              )}
            </ul>

            {isOwner && (
              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-sm font-bold text-gray-800 mb-3">Invite User</h4>
                <form onSubmit={handleInvite} className="flex flex-col space-y-3">
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    className="block w-full border border-gray-200 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm text-gray-900 bg-gray-50 hover:bg-white transition-colors"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="w-full flex justify-center items-center py-2.5 bg-blue-600 rounded-lg shadow-sm text-sm font-bold text-white hover:bg-blue-700 disabled:bg-blue-300 transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {inviteLoading ? 'Sending...' : 'Send Invite'}
                  </button>
                  {inviteMsg && <p className="text-xs font-bold text-green-600 text-center mt-2 animate-pulse">{inviteMsg}</p>}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Book Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all scale-100 border border-gray-100">
            <form onSubmit={handleDeleteBook}>
              <div className="px-6 py-8 sm:px-10">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 border border-red-100 mb-6 mx-auto shadow-inner">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
                  Delete Book?
                </h3>
                <p className="text-sm text-gray-500 text-center mb-8 max-w-sm mx-auto leading-relaxed">
                  This action is permanent and cannot be undone. You are about to delete <strong>{book?.name}</strong> and all its history.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
                      Type name to confirm
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={book?.name || ''}
                      className="block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-red-500 text-base text-gray-900 bg-gray-50 hover:bg-white transition-all font-medium"
                      value={deleteConfirmName}
                      onChange={(e) => setDeleteConfirmName(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50/80 px-8 py-5 flex flex-col sm:flex-row-reverse gap-3 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={deleteLoading || deleteConfirmName !== book?.name}
                  className="inline-flex justify-center flex-1 rounded-xl shadow-lg shadow-red-100 px-6 py-3 bg-red-600 text-base font-bold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed transition-all"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Forever'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmName('');
                  }}
                  className="inline-flex justify-center flex-1 rounded-xl border border-gray-200 shadow-sm px-6 py-3 bg-white text-base font-bold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
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
