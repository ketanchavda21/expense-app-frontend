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
      className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-[0_18px_42px_-22px_rgba(15,118,110,0.45)]"
    >
      <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-teal-100/40 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="flex items-start justify-between mb-4 relative">
        <div className="flex items-center space-x-3">
          <div className="rounded-xl border border-teal-100 bg-teal-50 p-2 transition-colors group-hover:bg-teal-100">
            <BookOpen className="h-5 w-5 text-teal-700" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-extrabold text-slate-900 line-clamp-1" title={book.name}>
              {book.name}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
              Created {new Date(book.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mb-6 flex items-center self-start rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
        <User className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
        <span className="truncate max-w-[150px]">Owner: {ownerName}</span>
      </div>
      
      <div className="mt-auto mb-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Total Balance
        </p>
        <p className={`text-3xl font-black tracking-tight ${isPositive ? 'text-slate-900' : 'text-rose-600'}`}>
          ₹{Math.abs(balance).toFixed(2)}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
        <div className="flex flex-col">
          <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Income</span>
          <span className="font-bold text-emerald-600">₹{Number(book.total_income || 0).toFixed(2)}</span>
        </div>
        <div className="h-6 w-px bg-slate-100"></div>
        <div className="flex flex-col items-end">
          <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Expense</span>
          <span className="font-bold text-rose-600">₹{Number(book.total_expense || 0).toFixed(2)}</span>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
