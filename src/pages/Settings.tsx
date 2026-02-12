import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Zap, AlertCircle, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user, profile, authorizeDeriv } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [derivToken, setDerivToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!profile) return;

    setIsLoading(true);

    try {
      const { error: err } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', profile.id);

      if (err) throw err;

      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectDeriv = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await authorizeDeriv(derivToken);
      setDerivToken('');
      setSuccess('Deriv account connected successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to connect Deriv account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage your account and preferences</p>
      </div>

      <div className="flex gap-2 border-b border-slate-700">
        {['profile', 'integrations', 'notifications', 'api'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 border-b-2 transition ${
              activeTab === tab
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Profile Settings</h2>

          <form onSubmit={handleUpdateProfile} className="max-w-md space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="input-field w-full"
              />
            </div>

            {profile?.deriv_account_id && (
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Connected Deriv Account
                </label>
                <div className="p-3 bg-slate-700 rounded-lg border border-green-600/30">
                  <p className="text-green-400 font-semibold flex items-center space-x-2">
                    <Check size={16} />
                    <span>{profile.deriv_email}</span>
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center space-x-2 bg-red-900/20 border border-red-700/50 rounded-lg p-3">
                <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 bg-green-900/20 border border-green-700/50 rounded-lg p-3">
                <Check size={20} className="text-green-400 flex-shrink-0" />
                <p className="text-green-300 text-sm">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-semibold transition"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <Zap size={24} className="text-yellow-400" />
              <span>Deriv Integration</span>
            </h2>

            {profile?.deriv_account_id ? (
              <div className="space-y-4">
                <p className="text-slate-300">Your Deriv account is connected</p>
                <div className="p-4 bg-green-900/20 rounded-lg border border-green-600/30">
                  <p className="text-green-400 font-semibold flex items-center space-x-2">
                    <Check size={20} />
                    <span>Connected: {profile.deriv_email}</span>
                  </p>
                </div>
                <p className="text-slate-400 text-sm">
                  Your account is successfully linked. You can now access live trading features.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-300 mb-4">
                  Connect your Deriv account to start trading
                </p>

                <div className="space-y-3">
                  <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                    <h3 className="text-white font-semibold mb-2">Option 1: OAuth (Recommended)</h3>
                    <p className="text-blue-300 text-sm mb-4">
                      Securely connect using Deriv OAuth. No need to copy API tokens.
                    </p>
                    <button
                      onClick={() => {
                        const appId = import.meta.env.VITE_DERIV_APP_ID;
                        if (!appId || appId === 'your_app_id_here') {
                          setError('Please set VITE_DERIV_APP_ID in your .env file');
                          return;
                        }
                        const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
                        window.location.href = `https://oauth.deriv.com/oauth2/authorize?app_id=${appId}&l=EN&brand=deriv`;
                      }}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                    >
                      Connect with Deriv OAuth
                    </button>
                    <p className="text-xs text-slate-400 mt-2">
                      Redirect URL: {window.location.origin}/auth/callback
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Add this URL to your Deriv app's redirect URLs
                    </p>
                  </div>

                  <div className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
                    <h3 className="text-white font-semibold mb-2">Option 2: API Token</h3>
                    <p className="text-slate-400 text-sm mb-4">
                      Manually enter your Deriv API token
                    </p>
                    <form onSubmit={handleConnectDeriv} className="space-y-3">
                      <input
                        type="password"
                        value={derivToken}
                        onChange={(e) => setDerivToken(e.target.value)}
                        placeholder="Enter your Deriv API token"
                        className="input-field w-full"
                        required
                      />
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-white rounded-lg font-semibold transition"
                      >
                        {isLoading ? 'Connecting...' : 'Connect with API Token'}
                      </button>
                      <a
                        href="https://app.deriv.com/account/api-token"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-blue-400 hover:text-blue-300 text-center"
                      >
                        Get your API token from Deriv
                      </a>
                    </form>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center space-x-2 bg-red-900/20 border border-red-700/50 rounded-lg p-3">
                    <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="flex items-center space-x-2 bg-green-900/20 border border-green-700/50 rounded-lg p-3">
                    <Check size={20} className="text-green-400 flex-shrink-0" />
                    <p className="text-green-300 text-sm">{success}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <Bell size={24} className="text-blue-400" />
            <span>Notification Preferences</span>
          </h2>

          <div className="space-y-4">
            {['Trade alerts', 'Signal updates', 'Bot performance', 'Copy trading changes'].map(
              (pref) => (
                <label key={pref} className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-slate-300">{pref}</span>
                </label>
              )
            )}
          </div>

          <button className="mt-6 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition">
            Save Preferences
          </button>
        </div>
      )}

      {activeTab === 'api' && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <Lock size={24} className="text-green-400" />
            <span>API Keys</span>
          </h2>

          <p className="text-slate-400 mb-6">Your API keys are secure and never shared</p>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Supabase URL
              </label>
              <input
                type="text"
                value={import.meta.env.VITE_SUPABASE_URL}
                disabled
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-400 text-xs cursor-not-allowed break-all"
              />
            </div>

            <button className="py-2 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-semibold transition">
              Regenerate Keys
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
