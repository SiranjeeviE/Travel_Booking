
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import Hotels from './pages/Hotels.tsx';
import Login from './pages/Login.tsx';
import Signup from './pages/Signup.tsx';
import Booking from './pages/Booking.tsx';
import MyBookings from './pages/MyBookings.tsx';
import AiItinerary from './pages/AiItinerary.tsx';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser && savedUser !== 'undefined') {
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error("Failed to restore user session:", err);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
                <span className="font-bold">E</span>
              </div>
              <span className="font-bold text-xl tracking-tight">Explore Ease</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Hotels</Link>
              <Link to="/ai-itinerary" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                AI Planner
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link to="/my-bookings" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">My Bookings</Link>
                <div className="flex items-center gap-4 border-l border-slate-800 pl-6">
                  <span className="text-sm font-medium text-slate-400 hidden sm:block">Hi, {user.name}</span>
                  <button 
                    onClick={handleLogout}
                    className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg font-bold transition-all"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Login</Link>
                <Link to="/signup" className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 w-full flex-grow">
        <Routes>
          <Route path="/" element={<Hotels />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup setUser={setUser} />} />
          <Route path="/booking/:hotelId" element={user ? <Booking /> : <Navigate to="/login" />} />
          <Route path="/my-bookings" element={user ? <MyBookings /> : <Navigate to="/login" />} />
          <Route path="/ai-itinerary" element={<AiItinerary />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      
      <footer className="border-t border-slate-900 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-sm">© 2025 Explore Ease. All rights reserved.</p>
          <div className="flex gap-8">
            <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Premium Travel Intelligence</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
