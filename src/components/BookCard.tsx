import React from 'react';
import { Link } from 'react-router-dom';
import type { Book } from '../types';
import { BookOpen, User } from 'lucide-react';

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const balance = book.balance || 0;
  const isPositive = balance >= 0;
  
  // Identify owner logic
  const ownerMember = book.members?.find(m => m.role === 'owner');
  const ownerName = ownerMember?.user?.name || 'Owner';

  return (
    <Link
      to={`/books/${book.slug}`}
      className="group bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col transition-all duration-200 hover:shadow-md hover:border-gray-300 relative"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-900 line-clamp-1" title={book.name}>
              {book.name}
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
              Created {new Date(book.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-md self-start mb-6 border border-gray-100">
        <User className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
        <span className="truncate max-w-[150px]">Owner: {ownerName}</span>
      </div>
      
      <div className="mt-auto mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
          Total Balance
        </p>
        <p className={`text-3xl font-semibold tracking-tight ${isPositive ? 'text-gray-900' : 'text-red-600'}`}>
          ₹{Math.abs(balance).toFixed(2)}
        </p>
      </div>

      <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100">
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Income</span>
          <span className="font-medium text-green-600">₹{Number(book.total_income || 0).toFixed(2)}</span>
        </div>
        <div className="h-6 w-px bg-gray-100"></div>
        <div className="flex flex-col items-end">
          <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Expense</span>
          <span className="font-medium text-red-600">₹{Number(book.total_expense || 0).toFixed(2)}</span>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
