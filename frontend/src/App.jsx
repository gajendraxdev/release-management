import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ReleaseList from './components/ReleaseList';
import ReleaseDetail from './components/ReleaseDetail';

function App() {
  return (
    <Router>
      <Toaster
        position="top-center"
        containerStyle={{ top: 16 }}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            borderRadius: '12px',
            padding: '14px 18px',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
          <header className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">ReleaseCheck</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">A Release Checklist Tool</p>
          </header>
          
          <Routes>
            <Route path="/" element={<ReleaseList />} />
            <Route path="/release/:id" element={<ReleaseDetail />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
