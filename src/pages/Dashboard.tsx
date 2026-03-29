import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import type { Book } from '../types';
import BookCard from '../components/BookCard';
import { PlusCircle, Loader2, BookOpen } from 'lucide-react';
import logo from '../assets/em.png';

const Dashboard = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create Book State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBookName, setNewBookName] = useState('');
  const [newBookDescription, setNewBookDescription] = useState('');
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
      alert(error.response?.data?.message || 'Failed to create book');
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <img src={logo} className="h-10" alt="Logo" />
            <h1 className="text-xl font-semibold">Expense Management</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1 ml-12">Manage all your expense records and groups.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Book
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl relative shadow-sm" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
          <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-sm font-semibold text-gray-900">No books found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new expense book.</p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <PlusCircle className="mr-2 h-4 w-4 text-blue-600" />
              New Book
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}

      {/* Create Book Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col transform transition-all">
            <form onSubmit={handleCreateBook}>
              <div className="px-6 py-6 sm:px-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">
                  Create New Book
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Book Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      className="block w-full border border-gray-200 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-colors text-gray-900 bg-gray-50 hover:bg-white"
                      placeholder="e.g. Trip to Paris"
                      value={newBookName}
                      onChange={(e) => setNewBookName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Description <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      className="block w-full border border-gray-200 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-colors text-gray-900 bg-gray-50 hover:bg-white"
                      placeholder="A short description about this book"
                      value={newBookDescription}
                      onChange={(e) => setNewBookDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50/80 px-6 py-4 flex flex-row-reverse space-x-3 space-x-reverse border-t border-gray-100">
                <button
                  type="submit"
                  disabled={createLoading}
                  className="inline-flex justify-center rounded-lg border border-transparent shadow-sm px-5 py-2 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-colors"
                >
                  {createLoading ? 'Saving...' : 'Save Book'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="inline-flex justify-center rounded-lg border border-gray-200 shadow-sm px-5 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
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
