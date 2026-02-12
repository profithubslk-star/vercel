import React from 'react';
import { TrendingUp, Shield, Bot, Zap, ArrowRight, BarChart3, Users, Clock } from 'lucide-react';
import logo from '../assets/red_logo_+_blue_letters.png';

interface HomeProps {
  onGetStarted: () => void;
}

export const Home: React.FC<HomeProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="ProfitHub" className="h-8" />
            </div>
            <button
              onClick={onGetStarted}
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition transform hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-transparent to-blue-600/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-red-600/10 border border-red-600/20 rounded-full px-4 py-2 mb-8">
              <Zap className="text-red-500" size={20} />
              <span className="text-red-400 font-semibold text-sm">Advanced Trading Platform</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Trade Smarter with
              <span className="block bg-gradient-to-r from-red-500 to-blue-600 bg-clip-text text-transparent">
                ProfitHub
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Automate your trading strategies, copy successful traders, and maximize profits with AI-powered trading bots
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-lg rounded-lg transition transform hover:scale-105 shadow-lg shadow-red-600/30 flex items-center space-x-2"
              >
                <span>Start Trading Now</span>
                <ArrowRight size={20} />
              </button>
              <button className="px-8 py-4 bg-slate-700/50 hover:bg-slate-700 text-white font-semibold text-lg rounded-lg transition border border-slate-600">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-slate-400">
              Powerful tools designed for modern traders
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 hover:border-red-600/50 transition group">
              <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg w-14 h-14 flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Bot className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Trading Bots</h3>
              <p className="text-slate-400 leading-relaxed">
                Create and deploy intelligent trading bots that execute your strategies 24/7 with precision
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 hover:border-blue-600/50 transition group">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg w-14 h-14 flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Users className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Copy Trading</h3>
              <p className="text-slate-400 leading-relaxed">
                Follow and replicate the strategies of successful traders automatically
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 hover:border-red-600/50 transition group">
              <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg w-14 h-14 flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <TrendingUp className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Live Trading Signals</h3>
              <p className="text-slate-400 leading-relaxed">
                Receive real-time market signals powered by advanced technical analysis
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 hover:border-blue-600/50 transition group">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg w-14 h-14 flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <BarChart3 className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Advanced Analytics</h3>
              <p className="text-slate-400 leading-relaxed">
                Track your performance with detailed reports and actionable insights
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 hover:border-red-600/50 transition group">
              <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg w-14 h-14 flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Shield className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Secure & Reliable</h3>
              <p className="text-slate-400 leading-relaxed">
                Enterprise-grade security with encrypted API connections and secure data storage
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 hover:border-blue-600/50 transition group">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg w-14 h-14 flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Clock className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">24/7 Trading</h3>
              <p className="text-slate-400 leading-relaxed">
                Never miss an opportunity with round-the-clock automated trading
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-red-600/10 to-blue-600/10 border border-red-600/20 rounded-3xl p-12">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent mb-2">
                  10K+
                </div>
                <div className="text-slate-400 font-medium">Active Traders</div>
              </div>
              <div>
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent mb-2">
                  $50M+
                </div>
                <div className="text-slate-400 font-medium">Trading Volume</div>
              </div>
              <div>
                <div className="text-5xl font-bold bg-gradient-to-r from-red-500 to-blue-600 bg-clip-text text-transparent mb-2">
                  99.9%
                </div>
                <div className="text-slate-400 font-medium">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-800/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Trading?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of successful traders using ProfitHub
          </p>
          <button
            onClick={onGetStarted}
            className="px-10 py-5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-lg rounded-lg transition transform hover:scale-105 shadow-xl shadow-red-600/30 flex items-center space-x-2 mx-auto"
          >
            <span>Get Started Free</span>
            <ArrowRight size={24} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-12 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img src={logo} alt="ProfitHub" className="h-6" />
            </div>
            <div className="text-slate-400 text-sm">
              © 2024 ProfitHub. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
