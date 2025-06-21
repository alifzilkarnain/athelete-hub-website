import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Target, BarChart3, Trophy, Zap, LogOut, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const openTennisSpeedDetection = () => {
    window.open('http://172.16.16.245:5000', '_blank', 'width=1200,height=800');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <Menu className="h-6 w-6 text-gray-400" />
          <div className="flex items-center space-x-2">
            <div className="bg-yellow-500 p-2 rounded-full">
              <Zap className="h-5 w-5 text-gray-900" />
            </div>
            <h1 className="text-xl font-bold">AthleteHub</h1>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <LogOut className="h-6 w-6" />
        </button>
      </div>

      {/* Welcome Section */}
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-gray-400 text-lg">Take control of your athletic journey</p>
          <p className="text-sm text-yellow-500 mt-2">Welcome back, {user?.email}</p>
        </div>

        {/* Sports Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <Link 
            to="/freekick-analysis"
            className="bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-yellow-500 transition-all duration-300 transform hover:scale-105 group"
          >
            <div className="bg-yellow-500 p-3 rounded-full inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
              <Target className="h-8 w-8 text-gray-900" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Free Kick Analysis</h3>
            <p className="text-gray-400 text-sm">Analyze your free kicks with AI-powered ball tracking</p>
          </Link>

          <Link 
            to="/cricket-analysis"
            className="bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-green-500 transition-all duration-300 transform hover:scale-105 group"
          >
            <div className="bg-green-500 p-3 rounded-full inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
              <Trophy className="h-8 w-8 text-gray-900" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Cricket Analysis</h3>
            <p className="text-gray-400 text-sm">Track cricket ball speed, bounce, and trajectory</p>
          </Link>

          <Link 
            to="/live-detection"
            className="bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-blue-500 transition-all duration-300 transform hover:scale-105 group"
          >
            <div className="bg-blue-500 p-3 rounded-full inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
              <Camera className="h-8 w-8 text-gray-900" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Live Ball Detection</h3>
            <p className="text-gray-400 text-sm">Real-time tennis ball and football detection</p>
          </Link>

          <button 
            onClick={openTennisSpeedDetection}
            className="bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-orange-500 transition-all duration-300 transform hover:scale-105 group text-left"
          >
            <div className="bg-orange-500 p-3 rounded-full inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
              <Zap className="h-8 w-8 text-gray-900" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Tennis Ball Live Speed</h3>
            <p className="text-gray-400 text-sm">Real-time tennis ball speed detection and tracking</p>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 rounded-2xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">12</p>
              <p className="text-gray-800 text-sm">Sessions</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">78.5</p>
              <p className="text-gray-800 text-sm">Avg Speed (km/h)</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">94%</p>
              <p className="text-gray-800 text-sm">Accuracy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;