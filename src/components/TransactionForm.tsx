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
        className="w-full flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
      >
        <PlusCircle className="h-5 w-5 mr-2" />
        Add Transaction
      </button>

      {isOpen && (
        <div className="fixed inset-0 overflow-hidden z-[60]">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
              onClick={handleClose}
              aria-hidden="true" 
            />
            
            <div className="fixed inset-y-0 right-0 max-w-full flex">
              <div className="w-screen max-w-md transform transition-transform ease-in-out duration-300">
                <div className="h-full flex flex-col bg-white shadow-xl border-l border-slate-200">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">New Transaction</h2>
                    <button
                      onClick={handleClose}
                      className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="relative flex-1 px-6 py-6 overflow-y-auto">
                    {error && (
                      <div className="mb-6 rounded-lg border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                        {error}
                      </div>
                    )}

                    <form id="transaction-form" onSubmit={handleSubmit} className="space-y-6">
                      {/* Type Toggle */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Transaction Type</label>
                        <div className="flex p-1 bg-slate-100 rounded-lg">
                          <button
                            type="button"
                            className={`flex-1 flex justify-center items-center py-2 px-3 text-sm font-semibold rounded-md transition-all ${
                              type === 'expense' 
                                ? 'bg-white shadow-sm text-rose-600' 
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                            onClick={() => setType('expense')}
                          >
                            <ArrowDownRight className={`h-4 w-4 mr-1.5 ${type === 'expense' ? 'text-rose-500' : 'text-slate-400'}`} />
                            Expense
                          </button>
                          <button
                            type="button"
                            className={`flex-1 flex justify-center items-center py-2 px-3 text-sm font-semibold rounded-md transition-all ${
                              type === 'income' 
                                ? 'bg-white shadow-sm text-emerald-600' 
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                            onClick={() => setType('income')}
                          >
                            <ArrowUpRight className={`h-4 w-4 mr-1.5 ${type === 'income' ? 'text-emerald-500' : 'text-slate-400'}`} />
                            Income
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <div>
                        <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          id="title"
                          required
                          className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-slate-900 shadow-sm transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 sm:text-sm"
                          placeholder="e.g. Dinner, Salary, Utilities"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>

                      {/* Date */}
                      <div>
                        <label htmlFor="date" className="block text-sm font-semibold text-slate-700 mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          id="date"
                          required
                          className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-slate-900 shadow-sm transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 sm:text-sm"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                      </div>

                      {/* Amount */}
                      <div>
                        <label htmlFor="amount" className="block text-sm font-semibold text-slate-700 mb-2">
                          Amount
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <span className="text-slate-500 font-medium sm:text-sm">₹</span>
                          </div>
                          <input
                            type="number"
                            id="amount"
                            step="0.01"
                            min="0.01"
                            required
                            className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-8 pr-3 font-semibold text-slate-900 shadow-sm transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 sm:text-base"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                          />
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Footer */}
                  <div className="p-6 border-t border-slate-100 bg-slate-50">
                    <button
                      type="submit"
                      form="transaction-form"
                      disabled={loading}
                      className="w-full flex justify-center items-center rounded-lg border border-transparent bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 disabled:bg-slate-400"
                    >
                      {loading ? 'Adding...' : 'Save Transaction'}
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="mt-3 w-full flex justify-center items-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
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
