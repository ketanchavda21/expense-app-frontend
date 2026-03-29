import React from 'react';
import type { Transaction } from '../types';
import { Trash2, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete?: (id: number) => void;
  currentUserId?: number;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, currentUserId }) => {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mb-3 rounded-full bg-slate-100 p-4">
          <Tag className="h-6 w-6 text-slate-300" />
        </div>
        <p className="font-semibold text-slate-600">No transactions found.</p>
        <p className="mt-1 text-sm text-slate-400">Add your first income or expense.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <ul className="divide-y divide-slate-100">
        {transactions.map((tx) => {
          return (
          <li key={tx.id} className="group flex items-center justify-between p-4 transition-colors hover:bg-slate-50/80 sm:px-6">
            <div className="flex items-center space-x-4">
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border shadow-sm ${
                  tx.type === 'income' 
                    ? 'border-emerald-100 bg-emerald-50 text-emerald-600' 
                    : 'border-rose-100 bg-rose-50 text-rose-600'
                }`}>
                {tx.type === 'income' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {tx.title}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                {tx.user?.name && (
                  <p className="text-[10px] text-slate-500 font-medium mt-1">
                    Added by: {tx.user.name}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-semibold tracking-tight ${
                tx.type === 'income' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
              }`}>
                {tx.type === 'income' ? '+' : '-'}₹{Number(tx.amount).toFixed(2)}
              </span>
              
              {onDelete && tx.user_id === currentUserId && (
                <button
                  onClick={() => onDelete(tx.id)}
                  className="rounded-lg p-2 text-slate-300 transition-all opacity-0 hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 focus:opacity-100"
                  title="Delete transaction"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TransactionList;
