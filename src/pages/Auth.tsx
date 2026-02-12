import React, { useState } from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';
import logo from '../assets/red_logo_+_blue_letters.png';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [error, setError] = useState('');

  const handleOAuthLogin = () => {
    const appId = import.meta.env.VITE_DERIV_APP_ID;
    if (!appId || appId === 'your_app_id_here') {
      setError('Please set VITE_DERIV_APP_ID in your .env file');
      return;
    }
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
    window.location.href = `https://oauth.deriv.com/oauth2/authorize?app_id=${appId}&l=EN&brand=deriv&redirect_uri=${redirectUri}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <img src={logo} alt="ProfitHub" className="h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to ProfitHub</h2>
            <p className="text-slate-400 text-sm">
              Connect your Deriv account to start trading
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleOAuthLogin}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 rounded-lg transition transform hover:scale-105 shadow-lg shadow-red-600/30"
            >
              Login with Deriv
            </button>

            {error && (
              <div className="flex items-center space-x-2 bg-red-900/20 border border-red-700/50 rounded-lg p-3">
                <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm mb-3">Don't have a Deriv account?</p>
            <a
              href="https://deriv.com/signup/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm font-semibold"
            >
              <span>Create one here</span>
              <ExternalLink size={16} />
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700">
            <p className="text-slate-500 text-xs text-center leading-relaxed">
              Your API token is securely encrypted and used only to connect to Deriv's trading API.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
