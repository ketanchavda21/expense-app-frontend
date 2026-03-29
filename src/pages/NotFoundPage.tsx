import { useNavigate } from 'react-router-dom';
import { FileQuestion, LayoutDashboard } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_30px_70px_-45px_rgba(15,23,42,0.85)] sm:p-14">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-slate-100 bg-slate-50 shadow-inner">
          <FileQuestion className="h-12 w-12 text-slate-400" />
        </div>

        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900">Book Not Found</h1>

        <p className="mx-auto mb-10 max-w-md text-base text-slate-500">
          The book you are looking for does not exist or has been permanently removed by its owner.
        </p>

        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:bg-slate-800"
        >
          <LayoutDashboard className="mr-3 h-5 w-5" />
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
