import { useNavigate } from 'react-router-dom';
import { FileQuestion, LayoutDashboard } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-14 max-w-xl w-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
        <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mb-8 shadow-inner border border-gray-100">
          <FileQuestion className="h-12 w-12 text-gray-400" />
        </div>
        
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
          Book Not Found
        </h1>
        
        <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto">
          The book you're looking for doesn't exist or has been permanently removed by its owner.
        </p>
        
        <button 
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center justify-center px-8 py-3.5 bg-blue-600 rounded-xl text-lg font-bold text-white hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 hover:-translate-y-0.5"
        >
          <LayoutDashboard className="h-5 w-5 mr-3" />
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
