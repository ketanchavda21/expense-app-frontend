import React from 'react';
import type { Transaction } from '../types';
import { Trash2, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete?: (id: number) => void;
  currentUserId?: number;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, currentUserId }) => {
  console.log("Transactions:", transactions);
  if (transactions.length === 0) {
    return (
      <div className="bg-white border text-center border-gray-200 rounded-xl shadow-sm p-10 flex flex-col items-center justify-center">
        <div className="bg-gray-50 p-4 rounded-full mb-3">
          <Tag className="h-6 w-6 text-gray-300" />
        </div>
        <p className="text-gray-500 font-medium">No transactions found.</p>
        <p className="text-gray-400 text-sm mt-1">Add your first income or expense.</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white border text-center border-gray-200 rounded-xl shadow-sm p-10 flex flex-col items-center justify-center">
        <div className="bg-gray-50 p-4 rounded-full mb-3">
          <Tag className="h-6 w-6 text-gray-300" />
        </div>
        <p className="text-gray-500 font-medium">No transactions found.</p>
        <p className="text-gray-400 text-sm mt-1">Add your first income or expense.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <ul className="divide-y divide-gray-100">
        {transactions.map((tx) => {
          console.log("Transaction:", tx);
          console.log("User:", currentUserId);
          console.log("Transaction Owner:", tx.user_id);
          
          return (
          <li key={tx.id} className="p-4 sm:px-6 hover:bg-gray-50/80 transition-colors group flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg shadow-sm border ${
                  tx.type === 'income' 
                    ? 'bg-green-50 border-green-100 text-green-600' 
                    : 'bg-red-50 border-red-100 text-red-600'
                }`}>
                {tx.type === 'income' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {tx.title}
                </p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                {tx.user?.name && (
                  <p className="text-[10px] text-gray-500 font-medium mt-1">
                    Added by: {tx.user.name}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-semibold tracking-tight ${
                tx.type === 'income' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
              }`}>
                {tx.type === 'income' ? '+' : '-'}₹{Number(tx.amount).toFixed(2)}
              </span>
              
              {onDelete && tx.user_id === currentUserId && (
                <button
                  onClick={() => onDelete(tx.id)}
                  className="text-gray-300 p-2 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
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
