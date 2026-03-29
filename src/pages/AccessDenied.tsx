import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-12 max-w-lg w-full text-center flex flex-col items-center animate-in fade-in zoom-in duration-300">
        <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <ShieldAlert className="h-10 w-10 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
          Access Denied
        </h1>
        
        <p className="text-gray-500 text-lg mb-8 max-w-sm">
          You don't have permission to view this book or its transactions. Please contact the owner for access.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 rounded-xl text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
          
          <button 
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 rounded-xl text-base font-semibold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Go Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
