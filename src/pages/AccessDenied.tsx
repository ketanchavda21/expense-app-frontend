import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_30px_70px_-45px_rgba(15,23,42,0.85)] sm:p-12">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 shadow-inner">
          <ShieldAlert className="h-10 w-10 text-rose-600" />
        </div>

        <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900">Access Denied</h1>

        <p className="mb-8 text-base text-slate-500">
          You do not have permission to view this book or its transactions. Contact the owner for access.
        </p>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-base font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-slate-900/20 transition-colors hover:bg-slate-800"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Go Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
