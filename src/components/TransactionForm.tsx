import React, { useState } from 'react';
import api from '../api/axios';
import { PlusCircle, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TransactionFormProps {
  bookSlug: string;
  onSuccess: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ bookSlug, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setType('expense');
    setDate(new Date().toISOString().split('T')[0]);
    setError('');
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !date) return;

    setLoading(true);
    setError('');

    try {
      await api.post(`/books/${bookSlug}/transactions`, {
        title,
        amount: parseFloat(amount),
        type,
        date,
      });
      handleClose();
      onSuccess();
    } catch (err) {
      const error = err as any;
      setError(error.response?.data?.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <PlusCircle className="h-5 w-5 mr-2" />
        Add Transaction
      </button>

      {isOpen && (
        <div className="fixed inset-0 overflow-hidden z-[60]">
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm transition-opacity" 
              onClick={handleClose}
              aria-hidden="true" 
            />
            
            <div className="fixed inset-y-0 right-0 max-w-full flex">
              <div className="w-screen max-w-md transform transition-transform ease-in-out duration-300">
                <div className="h-full flex flex-col bg-white shadow-xl border-l border-gray-200">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
                    <h2 className="text-lg font-bold text-gray-900 tracking-tight">New Transaction</h2>
                    <button
                      onClick={handleClose}
                      className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="relative flex-1 px-6 py-6 overflow-y-auto">
                    {error && (
                      <div className="mb-6 p-4 rounded-lg text-sm font-semibold text-red-700 bg-red-50 border border-red-100">
                        {error}
                      </div>
                    )}

                    <form id="transaction-form" onSubmit={handleSubmit} className="space-y-6">
                      {/* Type Toggle */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction Type</label>
                        <div className="flex p-1 bg-gray-100 rounded-lg">
                          <button
                            type="button"
                            className={`flex-1 flex justify-center items-center py-2 px-3 text-sm font-semibold rounded-md transition-all ${
                              type === 'expense' 
                                ? 'bg-white shadow-sm text-red-600' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                            onClick={() => setType('expense')}
                          >
                            <ArrowDownRight className={`h-4 w-4 mr-1.5 ${type === 'expense' ? 'text-red-500' : 'text-gray-400'}`} />
                            Expense
                          </button>
                          <button
                            type="button"
                            className={`flex-1 flex justify-center items-center py-2 px-3 text-sm font-semibold rounded-md transition-all ${
                              type === 'income' 
                                ? 'bg-white shadow-sm text-green-600' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                            onClick={() => setType('income')}
                          >
                            <ArrowUpRight className={`h-4 w-4 mr-1.5 ${type === 'income' ? 'text-green-500' : 'text-gray-400'}`} />
                            Income
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <div>
                        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          id="title"
                          required
                          className="block w-full border border-gray-200 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm text-gray-900 transition-colors shadow-sm bg-gray-50 hover:bg-white"
                          placeholder="e.g. Dinner, Salary, Utilities"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>

                      {/* Date */}
                      <div>
                        <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          id="date"
                          required
                          className="block w-full border border-gray-200 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm text-gray-900 transition-colors shadow-sm bg-gray-50 hover:bg-white"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                      </div>

                      {/* Amount */}
                      <div>
                        <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
                          Amount
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <span className="text-gray-500 font-medium sm:text-sm">₹</span>
                          </div>
                          <input
                            type="number"
                            id="amount"
                            step="0.01"
                            min="0.01"
                            required
                            className="block w-full border border-gray-200 rounded-lg py-2.5 pl-8 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base font-semibold text-gray-900 transition-colors shadow-sm bg-gray-50 hover:bg-white"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                          />
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Footer */}
                  <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <button
                      type="submit"
                      form="transaction-form"
                      disabled={loading}
                      className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-colors"
                    >
                      {loading ? 'Adding...' : 'Save Transaction'}
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="mt-3 w-full flex justify-center items-center py-2.5 px-4 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionForm;
