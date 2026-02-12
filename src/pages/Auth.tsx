import React, { useState, useEffect } from 'react';
import { AlertCircle, ExternalLink, Key } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/red_logo_+_blue_letters.png';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiToken, setApiToken] = useState('');
  const { authorizeDeriv } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token1 = urlParams.get('token1');
    const acct1 = urlParams.get('acct1');

    if (token1) {
      handleDerivCallback(token1, acct1 || '');
    }
  }, []);

  const handleDerivCallback = async (token: string, accountId: string) => {
    setIsLoading(true);
    setError('');

    try {
      await authorizeDeriv(token);
      window.history.replaceState({}, document.title, window.location.pathname);
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'Deriv authorization failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!apiToken.trim()) {
        throw new Error('Please enter your Deriv API token');
      }
      await authorizeDeriv(apiToken.trim());
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Deriv');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-white text-lg">Authorizing with Deriv...</p>
        </div>
      </div>
    );
  }

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

          <form onSubmit={handleTokenSubmit} className="space-y-6">
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
              <h4 className="text-blue-300 font-semibold mb-2 text-sm flex items-center space-x-2">
                <Key size={16} />
                <span>How to get your API Token:</span>
              </h4>
              <ol className="text-slate-300 text-sm space-y-1.5 list-decimal list-inside">
                <li>Visit <a href="https://app.deriv.com/account/api-token" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Deriv API Token page</a></li>
                <li>Create a new token with name "ProfitHub"</li>
                <li>Select scopes: <strong className="text-white">Read</strong>, <strong className="text-white">Trade</strong>, <strong className="text-white">Trading Information</strong></li>
                <li>Copy the generated token</li>
              </ol>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Deriv API Token
              </label>
              <input
                type="text"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="Enter your Deriv API token"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition"
                required
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 bg-red-900/20 border border-red-700/50 rounded-lg p-3">
                <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 text-white font-bold py-4 rounded-lg transition transform hover:scale-105 shadow-lg shadow-red-600/30"
            >
              {isLoading ? 'Connecting...' : 'Connect to Deriv'}
            </button>
          </form>

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
