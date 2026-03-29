import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import type { Book } from '../types';
import BookCard from '../components/BookCard';
import { PlusCircle, Loader2, BookOpen, ArrowRight, Sparkles, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import logo from '../assets/em.png';

const Dashboard = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create Book State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBookName, setNewBookName] = useState('');
  const [newBookDescription, setNewBookDescription] = useState('');
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await api.get('/books');
      const data = response.data.data || response.data;
      setBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load books. Please try again later.');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookName) return;

    setCreateLoading(true);
    setCreateError('');
    try {
      await api.post('/books', {
        name: newBookName,
        description: newBookDescription
      });
      
      setShowCreateModal(false);
      setNewBookName('');
      setNewBookDescription('');
      
      // Refresh the books list to ensure accurate server state
      fetchBooks();
    } catch (err) {
      const error = err as any;
      setCreateError(error.response?.data?.message || 'Failed to create book');
    } finally {
      setCreateLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value);

  const stats = useMemo(() => {
    const totalBooks = books.length;
    const totalIncome = books.reduce((sum, book) => sum + Number(book.total_income || 0), 0);
    const totalExpense = books.reduce((sum, book) => sum + Number(book.total_expense || 0), 0);
    const netBalance = books.reduce(
      (sum, book) => sum + Number(book.balance ?? Number(book.total_income || 0) - Number(book.total_expense || 0)),
      0
    );

    return { totalBooks, totalIncome, totalExpense, netBalance };
  }, [books]);

  if (loading) {
    return (
      <div className="min-h-[60vh] rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50 p-10 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-9 w-9 text-emerald-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">Preparing your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-emerald-50/40 to-sky-100/60 p-6 sm:p-8 shadow-[0_20px_70px_-30px_rgba(16,185,129,0.45)]">
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-24 left-16 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full border border-emerald-200 bg-white/90 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-700">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Smart expense workspace
            </div>
            <div className="flex items-center gap-3">
              <img src={logo} className="h-10 w-auto" alt="Logo" />
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Expense Management</h1>
            </div>
            <p className="max-w-2xl text-sm sm:text-base text-slate-600">
              Track all books in one place, monitor totals, and keep every record organized with clarity.
            </p>
          </div>
          <button
            onClick={() => {
              setShowCreateModal(true);
              setCreateError('');
            }}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Book
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Books</p>
            <BookOpen className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">{stats.totalBooks}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Total Income</p>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-black text-emerald-700">{formatCurrency(stats.totalIncome)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Total Expense</p>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-3 text-2xl font-black text-rose-600">{formatCurrency(stats.totalExpense)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Net Balance</p>
            <Wallet className="h-4 w-4 text-sky-600" />
          </div>
          <p className={`mt-3 text-2xl font-black ${stats.netBalance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
            {stats.netBalance < 0 ? '-' : ''}{formatCurrency(Math.abs(stats.netBalance))}
          </p>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700 shadow-sm" role="alert">
          <p className="text-sm font-medium">{error}</p>
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
            <BookOpen className="h-7 w-7 text-emerald-700" />
          </div>
          <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-900">No books yet</h3>
          <p className="mt-1 text-sm text-slate-500">Create your first expense book and start tracking in minutes.</p>
          <div className="mt-6">
            <button
              onClick={() => {
                setShowCreateModal(true);
                setCreateError('');
              }}
              className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Book
            </button>
          </div>
        </div>
      ) : (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Your Books</h2>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{books.length} total</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}

      {/* Create Book Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget && !createLoading) {
              setShowCreateModal(false);
            }
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_45px_100px_-40px_rgba(15,23,42,0.6)]">
            <form onSubmit={handleCreateBook}>
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-sky-500" />
              <div className="px-6 py-6 sm:px-8">
                <h3 className="mb-6 text-xl font-black tracking-tight text-slate-900">
                  Create New Book
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Book Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g. Trip to Paris"
                      value={newBookName}
                      onChange={(e) => setNewBookName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Description <span className="font-normal text-slate-400">(Optional)</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="A short description about this book"
                      value={newBookDescription}
                      onChange={(e) => setNewBookDescription(e.target.value)}
                    />
                  </div>
                  {createError && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">
                      {createError}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-row-reverse space-x-3 space-x-reverse border-t border-slate-100 bg-slate-50/80 px-6 py-4">
                <button
                  type="submit"
                  disabled={createLoading}
                  className="inline-flex justify-center rounded-xl border border-transparent bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {createLoading ? 'Saving...' : 'Save Book'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="inline-flex justify-center rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
