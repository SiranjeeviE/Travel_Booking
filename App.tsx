
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import Hotels from './pages/Hotels';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="font-bold">E</span>
            </div>
            <span className="font-bold text-xl tracking-tight">Explore Ease</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Hotels</Link>
            {user ? (
              <>
                <Link to="/my-bookings" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">My Bookings</Link>
                <div className="flex items-center gap-4 border-l border-slate-800 pl-6">
                  <span className="text-sm text-slate-400 hidden sm:block">Hi, {user.name}</span>
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
                <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Login</Link>
                <Link to="/signup" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <Routes>
          <Route path="/" element={<Hotels />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup setUser={setUser} />} />
          <Route path="/booking/:hotelId" element={user ? <Booking /> : <Navigate to="/login" />} />
          <Route path="/my-bookings" element={user ? <MyBookings /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
