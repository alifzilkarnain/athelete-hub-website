import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Target, TrendingUp, Users } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-yellow-500 p-4 rounded-full">
              <Zap className="h-12 w-12 text-gray-900" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Welcome to AthleteHub
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Track your performance, connect with your team, and achieve your goals with advanced analytics
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register"
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
            <Link 
              to="/login"
              className="border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-gray-900 font-semibold px-8 py-4 rounded-full transition-all duration-300"
            >
              Already a member? Login
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-yellow-500 transition-all duration-300 transform hover:scale-105">
            <Target className="h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Free Kick Analysis</h3>
            <p className="text-gray-400">
              Advanced ball trajectory tracking and speed analysis for your free kicks using AI-powered detection
            </p>
          </div>
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-yellow-500 transition-all duration-300 transform hover:scale-105">
            <TrendingUp className="h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Performance Tracking</h3>
            <p className="text-gray-400">
              Monitor your progress over time with detailed statistics and performance metrics
            </p>
          </div>
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-yellow-500 transition-all duration-300 transform hover:scale-105">
            <Users className="h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Team Integration</h3>
            <p className="text-gray-400">
              Connect with your team and share your achievements and progress
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-yellow-500 to-orange-500 p-12 rounded-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Elevate Your Game?
          </h2>
          <p className="text-gray-800 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of athletes who are already using AthleteHub to track their performance and achieve their goals
          </p>
          <Link 
            to="/register"
            className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-10 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg inline-block"
          >
            Start Your Journey
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;